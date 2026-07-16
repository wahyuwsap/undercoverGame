<script lang="ts">
  import { players, currentPhase, resetGame } from '$lib/stores/game';
  import { fade, slide } from 'svelte/transition';

  let selectedPlayerId: string | null = $state(null);
  let mrWhiteGuessPhase = $state(false);
  let eliminatedMrWhite: any = $state(null);
  let mrWhiteGuess = $state('');
  
  let gameOver = $state(false);
  let winners = $state('');

  let alivePlayers = $derived($players.filter(p => !p.isEliminated));

  function eliminate() {
    if (!selectedPlayerId) return;

    players.update(pts => {
      return pts.map(p => {
        if (p.id === selectedPlayerId) {
          p.isEliminated = true;
          if (p.role === 'Mr. White') {
            mrWhiteGuessPhase = true;
            eliminatedMrWhite = p;
          }
        }
        return p;
      });
    });

    if (!mrWhiteGuessPhase) {
      checkWinConditions();
    }
  }

  function submitMrWhiteGuess() {
    // Find the civilian word to check against
    const civilian = $players.find(p => p.role === 'Civilian');
    const correctWord = civilian ? civilian.word.toLowerCase() : '';

    if (mrWhiteGuess.toLowerCase().trim() === correctWord) {
      // Mr White wins!
      gameOver = true;
      winners = 'Mr. White';
    } else {
      // Wrong guess, continue checking regular win conditions
      mrWhiteGuessPhase = false;
      checkWinConditions();
    }
  }

  function checkWinConditions() {
    const alive = $players.filter(p => !p.isEliminated);
    const civilians = alive.filter(p => p.role === 'Civilian').length;
    const badGuys = alive.filter(p => p.role !== 'Civilian').length;

    if (badGuys >= civilians) {
      gameOver = true;
      winners = 'Impostors';
    } else if (badGuys === 0) {
      gameOver = true;
      winners = 'Civilians';
    } else {
      // No one won yet, go back to discussion
      selectedPlayerId = null;
      currentPhase.set('game');
    }
  }
</script>

<div in:fade class="flex flex-col h-full p-6 text-slate-100">
  {#if gameOver}
    <div in:scale class="flex-1 flex flex-col justify-center items-center text-center">
      <h2 class="text-4xl font-outfit font-bold mb-4 uppercase tracking-widest text-slate-400">Game Over</h2>
      
      <div class="mb-12 relative">
        <div class="absolute inset-0 bg-neon-pink/20 blur-[50px] rounded-full"></div>
        <h1 class="text-6xl font-outfit font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-neon-pink to-orange-400">
          {winners} WIN!
        </h1>
      </div>

      <div class="w-full bg-slate-800/60 rounded-3xl p-6 border border-slate-700 max-h-[50vh] overflow-y-auto mb-8 shadow-inner custom-scrollbar">
        <h3 class="font-outfit font-bold text-2xl mb-4 border-b border-slate-700/80 pb-3 text-slate-200">Roles Revealed</h3>
        <div class="space-y-2">
          {#each $players as p}
            <div class="flex justify-between items-center py-3 border-b border-slate-700/30 last:border-0">
              <span class="font-medium text-lg {p.isEliminated ? 'text-slate-500 line-through' : 'text-slate-100'}">{p.name}</span>
              <div class="text-right">
                <div class="text-sm font-bold uppercase tracking-wider {p.role === 'Civilian' ? 'text-neon-cyan' : p.role === 'Undercover' ? 'text-neon-pink' : 'text-white'}">{p.role}</div>
                {#if p.role !== 'Mr. White'}
                  <div class="text-sm text-slate-400 mt-0.5">{p.word}</div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>

      <button 
        onclick={resetGame}
        class="w-full py-4 rounded-full bg-gradient-to-r from-neon-pink to-neon-cyan text-white font-outfit font-bold text-xl shadow-[0_0_20px_rgba(255,42,133,0.4)] active:scale-95 transition-transform"
      >
        PLAY AGAIN
      </button>
    </div>
  {:else if mrWhiteGuessPhase}
    <div in:slide class="flex-1 flex flex-col justify-center items-center text-center">
      <div class="mb-8">
        <h2 class="text-3xl font-outfit font-bold text-white mb-2">Wait!</h2>
        <p class="text-slate-300 text-lg">
          <span class="font-bold text-neon-pink">{eliminatedMrWhite.name}</span> was Mr. White!
        </p>
      </div>

      <div class="w-full bg-slate-800/80 p-6 rounded-3xl border border-neon-cyan/30 backdrop-blur-md mb-8">
        <p class="text-slate-400 mb-4">Guess the Civilian word to steal the win:</p>
        <input 
          type="text" 
          bind:value={mrWhiteGuess}
          class="w-full bg-slate-900 border-2 border-slate-700 rounded-xl p-4 text-center text-2xl font-bold text-white focus:border-neon-cyan focus:ring-0 outline-none transition-colors"
          placeholder="Enter word..."
        />
      </div>

      <button 
        onclick={submitMrWhiteGuess}
        disabled={!mrWhiteGuess.trim()}
        class="w-full max-w-[250px] py-4 rounded-full bg-neon-cyan text-slate-900 font-outfit font-bold text-xl shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"
      >
        SUBMIT GUESS
      </button>
    </div>
  {:else}
    <div class="flex-1 flex flex-col">
      <div class="text-center mb-6 pt-4">
        <h2 class="text-2xl font-outfit font-bold tracking-widest text-slate-400 uppercase">Elimination</h2>
        <p class="text-slate-500 mt-2">Vote for the impostor</p>
      </div>

      <div class="space-y-3 flex-1 overflow-y-auto pr-2">
        {#each alivePlayers as p}
          <button 
            onclick={() => selectedPlayerId = p.id}
            class="w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 {selectedPlayerId === p.id ? 'bg-red-500/20 border-red-500' : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50'}"
          >
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold font-outfit text-lg {selectedPlayerId === p.id ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300'}">
                {p.name.charAt(0).toUpperCase()}
              </div>
              <span class="font-medium text-lg {selectedPlayerId === p.id ? 'text-white' : 'text-slate-300'}">{p.name}</span>
            </div>
          </button>
        {/each}
      </div>

      <button 
        onclick={eliminate}
        disabled={!selectedPlayerId}
        class="w-full mt-6 py-4 rounded-full bg-red-600 text-white font-outfit font-bold text-xl shadow-[0_0_20px_rgba(220,38,38,0.4)] active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"
      >
        ELIMINATE
      </button>
    </div>
  {/if}
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
