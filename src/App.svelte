<script lang="ts">
  import factory from "./RocketSim.js";

  const init = async () => {
    const RocketSim = await factory();
    console.log(RocketSim.BALL_COLLISION_RADIUS_SOCCAR);
  };

  init();
</script>
