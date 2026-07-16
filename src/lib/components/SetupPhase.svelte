<script lang="ts">
  import { gameConfig, players, currentPhase } from '$lib/stores/game';
  import { generatePlayers } from '$lib/utils/storage';
  import { fade, slide } from 'svelte/transition';
  import { onMount } from 'svelte';

  let names: string[] = $state(['Player 1', 'Player 2', 'Player 3', 'Player 4']);
  let error = $state('');

  onMount(() => {
    const saved = localStorage.getItem('undercover_saved_names');
    if (saved) {
      try {
        names = JSON.parse(saved);
        $gameConfig.totalPlayers = names.length;
      } catch (e) {}
    }
  });

  function addPlayer() {
    names = [...names, `Player ${names.length + 1}`];
    $gameConfig.totalPlayers = names.length;
  }

  function removePlayer(index: number) {
    if (names.length > 4) {
      names = names.filter((_, i) => i !== index);
      $gameConfig.totalPlayers = names.length;
    }
  }

  function startGame() {
    const totalBadGuys = $gameConfig.undercovers + $gameConfig.mrWhites;
    if (names.length <= totalBadGuys + 1) {
      error = 'Not enough civilians! Total players must be > Undercovers + Mr. Whites + 1';
      return;
    }
    
    error = '';
    localStorage.setItem('undercover_saved_names', JSON.stringify(names));
    const generated = generatePlayers(names, $gameConfig.undercovers, $gameConfig.mrWhites);
    players.set(generated);
    currentPhase.set('distribution');
  }
</script>

<div in:fade class="flex flex-col h-full p-6 text-slate-100 overflow-y-auto">
  <div class="text-center mb-8">
    <h1 class="text-4xl font-outfit font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-cyan">
      UNDERCOVER
    </h1>
    <p class="text-slate-400 mt-2 font-medium">Find the impostors among us.</p>
  </div>

  {#if error}
    <div transition:slide class="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4 text-sm text-center">
      {error}
    </div>
  {/if}

  <div class="space-y-6 flex-1">
    <div class="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
      <div class="flex justify-between items-center mb-4">
        <label class="font-outfit font-semibold text-lg text-neon-pink">Undercovers</label>
        <div class="flex items-center space-x-4">
          <button class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold" onclick={() => $gameConfig.undercovers = Math.max(0, $gameConfig.undercovers - 1)}>-</button>
          <span class="text-xl font-bold font-outfit w-4 text-center">{$gameConfig.undercovers}</span>
          <button class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold" onclick={() => $gameConfig.undercovers++}>+</button>
        </div>
      </div>

      <div class="flex justify-between items-center">
        <label class="font-outfit font-semibold text-lg text-neon-cyan">Mr. Whites</label>
        <div class="flex items-center space-x-4">
          <button class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold" onclick={() => $gameConfig.mrWhites = Math.max(0, $gameConfig.mrWhites - 1)}>-</button>
          <span class="text-xl font-bold font-outfit w-4 text-center">{$gameConfig.mrWhites}</span>
          <button class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold" onclick={() => $gameConfig.mrWhites++}>+</button>
        </div>
      </div>
      
      <div class="flex justify-between items-center mt-4 pt-4 border-t border-slate-700/50">
        <label class="font-outfit font-semibold text-lg text-slate-300">Tampilkan Role</label>
        <button 
          class="w-14 h-8 rounded-full p-1 transition-colors duration-300 ease-in-out {$gameConfig.showRoles ? 'bg-neon-cyan' : 'bg-slate-700'}"
          onclick={() => $gameConfig.showRoles = !$gameConfig.showRoles}
        >
          <div class="w-6 h-6 rounded-full bg-white transition-transform duration-300 ease-in-out {$gameConfig.showRoles ? 'translate-x-6' : 'translate-x-0'}"></div>
        </button>
      </div>
      
      <div class="flex justify-between items-center mt-4 pt-4 border-t border-slate-700/50">
        <div>
          <label class="font-outfit font-semibold text-lg text-slate-300 block">Voting Digital</label>
          <span class="text-xs text-slate-500">Gunakan aplikasi untuk proses eliminasi</span>
        </div>
        <button 
          class="w-14 h-8 rounded-full p-1 transition-colors duration-300 ease-in-out {$gameConfig.useDigitalVoting ? 'bg-neon-pink' : 'bg-slate-700'}"
          onclick={() => $gameConfig.useDigitalVoting = !$gameConfig.useDigitalVoting}
        >
          <div class="w-6 h-6 rounded-full bg-white transition-transform duration-300 ease-in-out {$gameConfig.useDigitalVoting ? 'translate-x-6' : 'translate-x-0'}"></div>
        </button>
      </div>
    </div>

    <div class="space-y-3">
      <div class="flex justify-between items-center">
        <h3 class="font-outfit font-semibold text-lg">Players ({names.length})</h3>
        <button onclick={addPlayer} class="text-sm text-neon-cyan font-bold bg-neon-cyan/10 px-3 py-1 rounded-full">+ Add</button>
      </div>
      
      <div class="space-y-2 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
        {#each names as name, i}
          <div transition:slide class="flex items-center space-x-2 bg-slate-800/40 p-2 rounded-xl border border-slate-700/50">
            <span class="w-6 text-center text-slate-500 font-bold">{i + 1}</span>
            <input 
              type="text" 
              bind:value={names[i]} 
              class="flex-1 bg-transparent border-none focus:ring-0 text-white font-medium placeholder-slate-500 outline-none"
              placeholder="Player Name"
            />
            {#if names.length > 4}
              <button onclick={() => removePlayer(i)} class="text-slate-500 hover:text-red-400 p-2">
                ✕
              </button>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>

  <button 
    onclick={startGame}
    class="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-neon-pink to-neon-cyan text-white font-outfit font-bold text-xl shadow-[0_0_20px_rgba(255,42,133,0.4)] transition-transform active:scale-95"
  >
    START GAME
  </button>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #475569;
    border-radius: 4px;
  }
</style>
