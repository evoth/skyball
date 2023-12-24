<script lang="ts">
  import { onMount } from "svelte";
  import Game from "./game/game";

  let container: HTMLElement;
  let game: Game;

  onMount(async () => {
    game = await Game.init(container);
  });
</script>

<div id="graphics" bind:this={container}></div>
{#if !game}
  <p>Loading...</p>
{/if}

<style>
  #graphics {
    position: fixed;
    left: 0px;
    top: 0px;
    z-index: -1;
  }
</style>
