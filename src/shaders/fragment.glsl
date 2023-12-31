#define MAX_STEPS 100
#define MAX_DIST 100.
#define BG -1.
#define ZERO 0

uniform float time;
uniform vec3 camPos;
uniform vec3 lightPos;
uniform vec2 resolution;
varying vec3 vPosition;

struct material {
    // R, G, B, multiplier
    int id;
    vec4 dif;
    vec4 spec;
    vec4 occ;
    vec4 amb;
    vec4 ref;
};

struct sdf {
    float dist;
    material mat;
};

struct march {
    float t;
    float minT;
    float minDist;
    material mat;
};

sdf opUnion(sdf d1, sdf d2) {
    if(d1.dist < d2.dist)
        return d1;
    return d2;
}

float sdTorus(vec3 p, vec2 t) {
    return length(vec2(length(p.xz) - t.x, p.y)) - t.y;
}

float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

sdf map(in vec3 p) {
    material m1 = material(1, vec4(0.0, 0.5, 1.0, 1.0), vec4(0.0, 1.0, 0.0, 20.0), vec4(0.5), vec4(0.05, 0.10, 0.3, 2.0), vec4(0.5));
    material m2 = material(2, vec4(1.0, 0.0, 0.0, 1.0), vec4(1.0, 1.0, 1.0, 20.0), vec4(0.5), vec4(0.05, 0.10, 0.3, 2.0), vec4(0.5));
    // sdf t1 = sdf(sdTorus(p, vec2(0.375, 0.125)), m1);
    sdf t1 = sdf(sdBox(p, vec3(0.3)), m1);
    sdf t2 = sdf(sdTorus(p - vec3(0.0, -1.0 * sin(time / 5.0), 0.0), vec2(1.0, 0.5)), m2);
    return opUnion(t1, t2);
}

march rayMarch(in vec3 ro, in vec3 rd, in float t0, in int maxSteps) {
    material nullMat = material(-1, vec4(0.0), vec4(0.0), vec4(0.0), vec4(0.0), vec4(0.0));
    float res = BG;

    float t = t0;
    float minT = MAX_DIST;
    float oldDist = MAX_DIST;
    sdf minH = sdf(MAX_DIST, nullMat);
    for(int i = 0; i < maxSteps && t < MAX_DIST; i++) {
        sdf h = map(ro + rd * t);
        if(h.dist < minH.dist && h.dist > oldDist) {
            minH = h;
            minT = t;
        }
        if(abs(h.dist) < (0.0001 * t)) {
            minH = h;
            minT = t;
            res = t;
            break;
        }
        // We're on the last iteration and relatively close to object
        else if(i == maxSteps - 1 && abs(h.dist) < (0.1 * t)) {
            minH = h;
            minT = t;
            res = t;
            break;
        }
        t += h.dist;
        oldDist = h.dist;
    }

    return march(res, minT, minH.dist, minH.mat);
}

// https://iquilezles.org/articles/rmshadows
float calcSoftshadow(in vec3 ro, in vec3 rd, float mint, float maxt, float w, int maxSteps) {
    float res = 1.0;
    float ph = 1e20;
    float t = mint;
    for(int i = 0; i < maxSteps && t < maxt; i++) {
        float h = map(ro + rd * t).dist;
        if(h < 0.001)
            return 0.0;
        float y = h * h / (2.0 * ph);
        float d = sqrt(h * h - y * y);
        res = min(res, d / (w * max(0.0, t - y)));
        ph = h;
        t += h;
    }
    return res;
}

// https://iquilezles.org/articles/normalsSDF
vec3 calcNormal(in vec3 pos) {
    // inspired by tdhooper and klems - a way to prevent the compiler from inlining map() 4 times
    vec3 n = vec3(0.0);
    for(int i = ZERO; i < 4; i++) {
        vec3 e = 0.5773 * (2.0 * vec3((((i + 3) >> 1) & 1), ((i >> 1) & 1), (i & 1)) - 1.0);
        n += e * map(pos + 0.0005 * e).dist;
      //if( n.x+n.y+n.z>100.0 ) break;
    }
    return normalize(n);
}

// https://iquilezles.org/articles/nvscene2008/rwwtt.pdf
float calcAO(in vec3 pos, in vec3 nor) {
    float occ = 0.0;
    float sca = 1.0;
    for(int i = 0; i < 5; i++) {
        float h = 0.001 + 0.15 * float(i) / 4.0;
        float d = map(pos + h * nor).dist;
        occ += (h - d) * sca;
        sca *= 0.95;
    }
    return clamp(1.0 - 1.5 * occ, 0.0, 1.0);
}

vec3 getColor(in vec3 p, in vec3 rd, in material mat) {
    // TODO: Figure out directional light (parallel rays)
    vec3 l = normalize(lightPos - p);
    vec3 hal = normalize(l - rd);
    vec3 n = calcNormal(p);

    vec3 col = vec3(0.0);

    float dif = clamp(dot(n, l), 0.0, 1.0);
    dif *= calcSoftshadow(p, l, 0.1, 3.0, 0.1, MAX_STEPS / 2);
    col = mat.dif.w * mat.dif.rgb * dif;

    // TODO: Figure out how to selectively add and multiply stuff
    if(mat.spec.w > 0.0) {
        float spec = pow(clamp(dot(n, hal), 0.0, 1.0), 16.0) *
            dif *
            (0.04 + 0.96 * pow(clamp(1.0 + dot(hal, rd), 0.0, 1.0), 5.0));
        col += mat.spec.w * mat.spec.rgb * spec;
    }

    if(mat.occ.w > 0.0) {
        float occ = calcAO(p, n);
        col += mat.occ.w * mat.occ.rgb * mat.dif.rgb * occ;
    }

    if(mat.amb.w > 0.0) {
        float amb = clamp(0.5 + 0.5 * n.y, 0.0, 1.0);
        col += mat.amb.w * mat.amb.rgb * mat.dif.rgb * amb;
    }

    return col;
}

vec4 render(in vec3 ro, in vec3 rd) {
    march res = rayMarch(ro, rd, 0.0, MAX_STEPS);
    material mat = res.mat;

    float o = 0.0;

    // TODO: Add AA to object in front of other objects
    float th1 = 1.0 / resolution.y * res.minT;
    float th2 = 2.0 / resolution.y * res.minT;
    if(res.t == BG && res.minDist < th2) {
        o = 1.0 - (res.minDist - th1) / (th2 - th1);
        // 0.02 is because it was catching the color of back faces
        res.t = res.minT - 0.02;
    } else if(res.t != BG) {
        o = 1.0;
    }

    if(o == 0.0)
        return vec4(0.0);

    vec3 p = ro + rd * res.t;

    vec3 col = getColor(p, rd, mat);

    // TODO: Add light source reflections (compute "light map" from normal?)
    if(mat.ref.w > 0.0) {
        vec3 n = calcNormal(p);
        vec3 ref = normalize(reflect(rd, n));

        res = rayMarch(p, ref, 0.01, MAX_STEPS / 2);
        material refMat = res.mat;

        if(res.t != BG) {
            p += ref * res.t;

            vec3 refCol = getColor(p, ref, refMat);
            col += mat.ref.w * mat.ref.rgb * refCol.rgb;
        }
    }

    return vec4(col, o);
}

void main() {

    vec3 ro = camPos;
    vec3 rd = normalize(vPosition - ro);
    vec4 col = render(ro, rd);

    gl_FragColor = col;
}