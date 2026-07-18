<script lang="ts">
  import { players, currentPhase, gameConfig } from '$lib/stores/game';
  import { fade, scale } from 'svelte/transition';
  import { onMount } from 'svelte';

  let distributionOrder = $state<number[]>([]);
  let currentOrderIndex = $state(0);
  let isRevealed = $state(false);

  onMount(() => {
    const startIndex = Math.floor(Math.random() * $players.length);
    let order: number[] = [];
    for (let i = 0; i < $players.length; i++) {
      order.push((startIndex + i) % $players.length);
    }
    distributionOrder = order;
  });

  let player = $derived($players[distributionOrder[currentOrderIndex]] || $players[0]);

  function reveal() {
    isRevealed = true;
  }

  function hideAndPass() {
    isRevealed = false;
    if (currentOrderIndex < distributionOrder.length - 1) {
      currentOrderIndex++;
    } else {
      currentPhase.set('game');
    }
  }
</script>

<div in:fade class="flex flex-col h-full p-6 text-slate-100 justify-center items-center">
  {#if !isRevealed}
    <div in:scale class="text-center w-full">
      <div class="mb-12">
        <p class="text-slate-400 font-medium mb-2 uppercase tracking-widest text-sm">Pass the device to</p>
        <h2 class="text-5xl font-outfit font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-blue-500">
          {player.name}
        </h2>
      </div>
      
      <button 
        onclick={reveal}
        class="w-full max-w-[250px] mx-auto py-5 rounded-3xl bg-slate-800 border-2 border-neon-cyan/50 text-neon-cyan font-outfit font-bold text-xl shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all active:scale-95"
      >
        TAP TO REVEAL
      </button>
    </div>
  {:else}
    <div in:scale class="text-center w-full flex flex-col items-center">
      <div class="mb-10 w-full bg-slate-800/80 p-8 rounded-3xl border border-slate-700 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-neon-pink/10 to-neon-cyan/10 pointer-events-none"></div>
        
        <p class="text-slate-400 text-sm uppercase tracking-widest mb-4">Your Role</p>
        
        {#if player.role === 'Mr. White'}
          <h3 class="text-4xl font-outfit font-bold text-white mb-2">Mr. White</h3>
          <p class="text-slate-300 mt-6 text-lg px-4">You have <span class="text-neon-pink font-bold">NO WORD</span>. Try to blend in and guess the civilian word!</p>
        {:else}
          {#if $gameConfig.showRoles}
            <h3 class="text-3xl font-outfit font-bold text-slate-200 mb-6">{player.role}</h3>
          {:else}
            <div class="h-12"></div> <!-- Spacer to maintain card size when role is hidden -->
          {/if}
          <p class="text-slate-400 text-sm uppercase tracking-widest mb-2">Your Secret Word</p>
          <div class="text-5xl font-outfit font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-cyan py-2">
            {player.word}
          </div>
        {/if}
      </div>

      <button 
        onclick={hideAndPass}
        class="w-full max-w-[250px] py-4 rounded-full bg-gradient-to-r from-neon-pink to-purple-600 text-white font-outfit font-bold text-lg shadow-[0_0_20px_rgba(255,42,133,0.4)] transition-all active:scale-95"
      >
        HIDE & PASS
      </button>
      <p class="text-slate-500 text-sm mt-4">Make sure no one else is looking!</p>
    </div>
  {/if}
</div>
