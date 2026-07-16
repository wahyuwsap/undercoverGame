<script lang="ts">
  import { players, currentPhase, gameConfig } from '$lib/stores/game';
  import { fade, slide } from 'svelte/transition';
  import { onMount } from 'svelte';

  let turnOrder: number[] = $state([]);
  let currentSpeakerIndex = $state(0); // Index in the turnOrder array

  onMount(() => {
    // Generate a list of alive player indices
    const aliveIndices = $players.map((p, i) => i).filter(i => !$players[i].isEliminated);
    
    // Pick a random starting index
    const startIndex = Math.floor(Math.random() * aliveIndices.length);
    
    // Create the order starting from that index, wrapping around
    for (let i = 0; i < aliveIndices.length; i++) {
      turnOrder.push(aliveIndices[(startIndex + i) % aliveIndices.length]);
    }
  });

  function nextTurn() {
    if (currentSpeakerIndex < turnOrder.length - 1) {
      currentSpeakerIndex++;
    } else {
      // Everyone has spoken!
      currentPhase.set('vote');
    }
  }

  let currentSpeaker = $derived($players[turnOrder[currentSpeakerIndex]]);
</script>

<div in:fade class="flex flex-col h-full p-6 text-slate-100">
  {#if $gameConfig.useDigitalVoting}
    <div class="text-center mb-6 pt-4">
      <h2 class="text-2xl font-outfit font-bold tracking-widest text-slate-400 uppercase">Discussion Phase</h2>
      <div class="h-1 w-20 bg-gradient-to-r from-neon-pink to-neon-cyan mx-auto mt-2 rounded-full"></div>
    </div>

    {#if currentSpeaker}
      <div class="flex-1 flex flex-col justify-center items-center text-center">
        <div class="relative w-full max-w-sm">
          <!-- Glowing aura behind the active speaker -->
          <div class="absolute inset-0 bg-neon-cyan/20 blur-[50px] rounded-full"></div>
          
          <div class="bg-slate-800/80 p-8 rounded-[40px] border border-neon-cyan/30 backdrop-blur-md relative shadow-2xl">
            <p class="text-slate-400 uppercase tracking-widest text-sm mb-4">It's time to speak for</p>
            <h3 class="text-5xl font-outfit font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
              {currentSpeaker.name}
            </h3>
            <p class="text-slate-300 text-lg">Give a clue about your word!</p>
          </div>
        </div>

        <button 
          onclick={nextTurn}
          class="mt-12 w-full max-w-[250px] py-4 rounded-full bg-slate-100 text-slate-900 font-outfit font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all active:scale-95"
        >
          NEXT PLAYER
        </button>
      </div>
    {/if}

    <!-- Turn tracker dots -->
    <div class="flex justify-center space-x-2 pb-6 mt-8">
      {#each turnOrder as _, i}
        <div class="w-2.5 h-2.5 rounded-full transition-all duration-300 {i === currentSpeakerIndex ? 'bg-neon-cyan shadow-[0_0_8px_rgba(0,240,255,0.8)] scale-125' : i < currentSpeakerIndex ? 'bg-slate-500' : 'bg-slate-800 border border-slate-600'}"></div>
      {/each}
    </div>
  {:else}
    <!-- Offline Voting Mode -->
    <div class="flex-1 flex flex-col justify-center items-center text-center">
      <div class="mb-12 relative w-full max-w-sm">
        <div class="absolute inset-0 bg-neon-pink/20 blur-[60px] rounded-full"></div>
        <div class="bg-slate-800/80 p-10 rounded-[40px] border border-neon-pink/30 backdrop-blur-md relative shadow-2xl">
          <h2 class="text-4xl font-outfit font-bold text-white mb-6">Real Life Mode</h2>
          <p class="text-slate-300 text-lg leading-relaxed">
            Silakan berdiskusi dan lakukan voting secara langsung di dunia nyata.
          </p>
          <p class="text-slate-400 text-sm mt-6 uppercase tracking-widest">
            Jika sudah selesai, klik di bawah!
          </p>
        </div>
      </div>

      <button 
        onclick={() => currentPhase.set('vote')}
        class="w-full max-w-[280px] py-4 rounded-full bg-gradient-to-r from-neon-pink to-orange-400 text-white font-outfit font-bold text-xl shadow-[0_0_20px_rgba(255,42,133,0.4)] transition-transform active:scale-95"
      >
        TAMPILKAN PERAN
      </button>
    </div>
  {/if}
</div>
