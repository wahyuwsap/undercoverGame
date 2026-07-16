<script lang="ts">
  import { currentPhase } from '$lib/stores/game';
  import SetupPhase from '$lib/components/SetupPhase.svelte';
  import DistributionPhase from '$lib/components/DistributionPhase.svelte';
  import GamePhase from '$lib/components/GamePhase.svelte';
  import VotePhase from '$lib/components/VotePhase.svelte';
</script>

<div class="h-full relative w-full">
  {#if $currentPhase === 'setup'}
    <SetupPhase />
  {:else if $currentPhase === 'distribution'}
    <DistributionPhase />
  {:else if $currentPhase === 'game'}
    <GamePhase />
  {:else if $currentPhase === 'vote' || $currentPhase === 'end'}
    <VotePhase />
  {/if}
</div>
