interface Track {
  id: number;
  title: string;
  artist: string;
  duration: number;
  url: string;
  filePath?: string;
}

interface LyricLine {
  time: number;
  text: string;
}

interface Note {
  id: number;
  trackId: number | null;
  trackTitle: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface SavedPlaylist {
  tracks: Array<{
    id: number;
    title: string;
    artist: string;
    duration: number;
    filePath: string;
  }>;
  currentIndex: number;
}

const isTauri = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI__' in window;
};

class MusicPlayer {
  private audio: HTMLAudioElement;
  private playlist: Track[] = [];
  private favorites: number[] = [];
  private notes: Note[] = [];
  private editingNoteId: number | null = null;
  private currentIndex: number = -1;
  private isPlaying: boolean = false;
  private isExpanded: boolean = false;
  private shuffle: boolean = false;
  private repeat: boolean = false;
  private currentTheme: string = 'light';
  private lyrics: LyricLine[] = [];
  private currentLyricIndex: number = -1;
  private hasRealLyrics: boolean = false;
  private currentView: string = 'library';
  private sleepTimerId: number | null = null;
  private sleepEndTime: number | null = null;

  // Performance: RAF throttling
  private rafId: number | null = null;
  private lastProgressUpdate: number = 0;
  private lastLyricUpdate: number = 0;

  // UI Elements
  private triFold!: HTMLElement;
  private btnExpand!: HTMLElement;
  private btnBack!: HTMLElement;
  private btnCollapseHint!: HTMLElement;
  private btnPlay!: HTMLElement;
  private btnFullPlay!: HTMLElement;
  private iconPlay!: HTMLElement;
  private iconPause!: HTMLElement;
  private fullIconPlay!: HTMLElement;
  private fullIconPause!: HTMLElement;
  private btnPrev!: HTMLElement;
  private btnNext!: HTMLElement;
  private btnFullPrev!: HTMLElement;
  private btnFullNext!: HTMLElement;
  private btnShuffle!: HTMLElement;
  private btnRepeat!: HTMLElement;
  private btnFullShuffle!: HTMLElement;
  private btnFullRepeat!: HTMLElement;
  private progressBar!: HTMLElement;
  private progressFill!: HTMLElement;
  private progressHandle!: HTMLElement;
  private fullProgressBar!: HTMLElement;
  private fullProgressFill!: HTMLElement;
  private fullProgressHandle!: HTMLElement;
  private currentTimeEl!: HTMLElement;
  private totalTimeEl!: HTMLElement;
  private fullCurrentTimeEl!: HTMLElement;
  private fullTotalTimeEl!: HTMLElement;
  private trackTitle!: HTMLElement;
  private trackArtist!: HTMLElement;
  private fullTrackTitle!: HTMLElement;
  private fullTrackArtist!: HTMLElement;
  private lyricsTrackTitle!: HTMLElement;
  private lyricsTrackArtist!: HTMLElement;
  private albumArt!: HTMLElement;
  private vinylGrooves!: HTMLElement;
  private playlistList!: HTMLElement;
  private playlistCount!: HTMLElement;
  private lyricsContent!: HTMLElement;
  private fileInput!: HTMLInputElement;
  private btnAddMusic!: HTMLElement;
  private btnScanFolder!: HTMLElement;
  private btnClose!: HTMLElement;
  private btnMinimize!: HTMLElement;
  private btnMaximize!: HTMLElement;
  private btnMoreMenu!: HTMLElement;
  private dropdownMenu!: HTMLElement;
  private overlay!: HTMLElement;
  private eqDrawer!: HTMLElement;
  private btnEqDrawerClose!: HTMLElement;
  private btnDropdownEq!: HTMLElement;
  private volumeDrawer!: HTMLElement;
  private btnVolumeDrawerClose!: HTMLElement;
  private volumeSlider!: HTMLInputElement;
  private volumeValue!: HTMLElement;
  private sleepDrawer!: HTMLElement;
  private btnSleepDrawerClose!: HTMLElement;
  private sleepStatus!: HTMLElement;
  private btnCancelSleep!: HTMLElement;
  private btnVolume!: HTMLElement;
  private btnFavoriteToggle!: HTMLElement;
  private btnEqualizer!: HTMLElement;
  private btnSleep!: HTMLElement;
  private sideNav!: HTMLElement;
  private noteDrawer!: HTMLElement;
  private btnNoteDrawerClose!: HTMLElement;
  private noteDrawerTitle!: HTMLElement;
  private noteSongInfo!: HTMLElement;
  private noteTextarea!: HTMLTextAreaElement;
  private btnSaveNote!: HTMLElement;
  private btnDeleteNote!: HTMLElement;
  private themeDrawer!: HTMLElement;
  private btnThemeDrawerClose!: HTMLElement;
  private btnDropdownTheme!: HTMLElement;

  constructor() {
    this.audio = new Audio();
    this.audio.volume = 0.8;
    this.audio.addEventListener('timeupdate', () => this.onTimeUpdate());
    this.audio.addEventListener('ended', () => this.onTrackEnded());
    this.audio.addEventListener('loadedmetadata', () => this.onMetadataLoaded());

    this.loadFavorites();
    this.loadNotes();
    this.initElements();
    this.bindEvents();
    this.loadTheme();
    this.loadPlaylistFromDisk();
    this.showNoLyrics();
  }

  private initElements(): void {
    this.triFold = document.getElementById('tri-fold')!;
    this.btnExpand = document.getElementById('btn-expand')!;
    this.btnBack = document.getElementById('btn-back')!;
    this.btnCollapseHint = document.getElementById('btn-collapse-hint')!;
    this.btnPlay = document.getElementById('btn-play')!;
    this.btnFullPlay = document.getElementById('full-btn-play')!;
    this.iconPlay = document.getElementById('icon-play')!;
    this.iconPause = document.getElementById('icon-pause')!;
    this.fullIconPlay = document.getElementById('full-icon-play')!;
    this.fullIconPause = document.getElementById('full-icon-pause')!;
    this.btnPrev = document.getElementById('btn-prev')!;
    this.btnNext = document.getElementById('btn-next')!;
    this.btnFullPrev = document.getElementById('full-btn-prev')!;
    this.btnFullNext = document.getElementById('full-btn-next')!;
    this.btnShuffle = document.getElementById('btn-shuffle')!;
    this.btnRepeat = document.getElementById('btn-repeat')!;
    this.btnFullShuffle = document.getElementById('full-btn-shuffle')!;
    this.btnFullRepeat = document.getElementById('full-btn-repeat')!;
    this.progressBar = document.getElementById('progress-bar')!;
    this.progressFill = document.getElementById('progress-fill')!;
    this.progressHandle = document.getElementById('progress-handle')!;
    this.fullProgressBar = document.getElementById('full-progress-bar')!;
    this.fullProgressFill = document.getElementById('full-progress-fill')!;
    this.fullProgressHandle = document.getElementById('full-progress-handle')!;
    this.currentTimeEl = document.getElementById('current-time')!;
    this.totalTimeEl = document.getElementById('total-time')!;
    this.fullCurrentTimeEl = document.getElementById('full-current-time')!;
    this.fullTotalTimeEl = document.getElementById('full-total-time')!;
    this.trackTitle = document.getElementById('track-title')!;
    this.trackArtist = document.getElementById('track-artist')!;
    this.fullTrackTitle = document.getElementById('full-track-title')!;
    this.fullTrackArtist = document.getElementById('full-track-artist')!;
    this.lyricsTrackTitle = document.getElementById('lyrics-track-title')!;
    this.lyricsTrackArtist = document.getElementById('lyrics-track-artist')!;
    this.albumArt = document.getElementById('album-art')!;
    this.vinylGrooves = document.querySelector('.vinyl-grooves')!;
    this.playlistList = document.getElementById('playlist-list')!;
    this.playlistCount = document.getElementById('playlist-count')!;
    this.lyricsContent = document.getElementById('lyrics-content')!;
    this.fileInput = document.getElementById('file-input') as HTMLInputElement;
    this.btnAddMusic = document.getElementById('btn-add-music')!;
    this.btnScanFolder = document.getElementById('btn-scan-folder')!;
    this.btnClose = document.getElementById('btn-close')!;
    this.btnMinimize = document.getElementById('btn-minimize')!;
    this.btnMaximize = document.getElementById('btn-maximize')!;
    this.btnMoreMenu = document.getElementById('btn-more-menu')!;
    this.dropdownMenu = document.getElementById('dropdown-menu')!;
    this.overlay = document.getElementById('overlay')!;
    this.eqDrawer = document.getElementById('eq-drawer')!;
    this.btnEqDrawerClose = document.getElementById('eq-drawer-close')!;
    this.btnDropdownEq = document.getElementById('dropdown-eq')!;
    this.volumeDrawer = document.getElementById('volume-drawer')!;
    this.btnVolumeDrawerClose = document.getElementById('volume-drawer-close')!;
    this.volumeSlider = document.getElementById('volume-slider') as HTMLInputElement;
    this.volumeValue = document.getElementById('volume-value')!;
    this.sleepDrawer = document.getElementById('sleep-drawer')!;
    this.btnSleepDrawerClose = document.getElementById('sleep-drawer-close')!;
    this.sleepStatus = document.getElementById('sleep-status')!;
    this.btnCancelSleep = document.getElementById('btn-cancel-sleep')!;
    this.btnVolume = document.getElementById('btn-volume')!;
    this.btnFavoriteToggle = document.getElementById('btn-favorite-toggle')!;
    this.btnEqualizer = document.getElementById('btn-equalizer')!;
    this.btnSleep = document.getElementById('btn-sleep')!;
    this.sideNav = document.getElementById('side-nav')!;
    this.noteDrawer = document.getElementById('note-drawer')!;
    this.btnNoteDrawerClose = document.getElementById('note-drawer-close')!;
    this.noteDrawerTitle = document.getElementById('note-drawer-title')!;
    this.noteSongInfo = document.getElementById('note-song-info')!;
    this.noteTextarea = document.getElementById('note-textarea') as HTMLTextAreaElement;
    this.btnSaveNote = document.getElementById('btn-save-note')!;
    this.btnDeleteNote = document.getElementById('btn-delete-note')!;
    this.themeDrawer = document.getElementById('theme-drawer')!;
    this.btnThemeDrawerClose = document.getElementById('theme-drawer-close')!;
    this.btnDropdownTheme = document.getElementById('dropdown-theme')!;
  }

  private bindEvents(): void {
    this.btnExpand.addEventListener('click', () => this.expand());
    this.btnBack.addEventListener('click', () => this.collapse());
    this.btnCollapseHint.addEventListener('click', () => this.collapse());

    this.btnPlay.addEventListener('click', () => this.togglePlay());
    this.btnFullPlay.addEventListener('click', () => this.togglePlay());
    this.btnPrev.addEventListener('click', () => this.prevTrack());
    this.btnNext.addEventListener('click', () => this.nextTrack());
    this.btnFullPrev.addEventListener('click', () => this.prevTrack());
    this.btnFullNext.addEventListener('click', () => this.nextTrack());

    this.btnShuffle.addEventListener('click', () => this.toggleShuffle());
    this.btnRepeat.addEventListener('click', () => this.toggleRepeat());
    this.btnFullShuffle.addEventListener('click', () => this.toggleShuffle());
    this.btnFullRepeat.addEventListener('click', () => this.toggleRepeat());

    this.progressBar.addEventListener('click', (e) => this.seek(e, this.progressBar));
    this.fullProgressBar.addEventListener('click', (e) => this.seek(e, this.fullProgressBar));

    this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    this.btnAddMusic.addEventListener('click', () => this.openFileDialog());
    this.btnScanFolder.addEventListener('click', () => this.scanFolder());

    this.btnClose.addEventListener('click', () => this.closeWindow());
    this.btnMinimize.addEventListener('click', () => this.minimizeWindow());
    this.btnMaximize.addEventListener('click', () => this.maximizeWindow());

    // Dropdown menu
    this.btnMoreMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });
    this.btnDropdownEq.addEventListener('click', () => {
      this.hideDropdown();
      this.showEqDrawer();
    });
    this.btnDropdownTheme.addEventListener('click', () => {
      this.hideDropdown();
      this.showThemeDrawer();
    });
    this.btnEqDrawerClose.addEventListener('click', () => this.hideEqDrawer());
    this.btnThemeDrawerClose.addEventListener('click', () => this.hideThemeDrawer());
    this.btnVolumeDrawerClose.addEventListener('click', () => this.hideVolumeDrawer());
    this.btnSleepDrawerClose.addEventListener('click', () => this.hideSleepDrawer());
    this.btnNoteDrawerClose.addEventListener('click', () => this.hideNoteDrawer());
    this.overlay.addEventListener('click', () => {
      this.hideDropdown();
      this.hideEqDrawer();
      this.hideVolumeDrawer();
      this.hideSleepDrawer();
      this.hideNoteDrawer();
      this.hideThemeDrawer();
    });
    document.addEventListener('click', () => this.hideDropdown());

    // Extra controls
    this.btnVolume.addEventListener('click', () => this.showVolumeDrawer());
    this.btnFavoriteToggle.addEventListener('click', () => this.toggleFavoriteCurrent());
    this.btnEqualizer.addEventListener('click', () => {
      this.hideDropdown();
      this.showEqDrawer();
    });
    this.btnSleep.addEventListener('click', () => this.showSleepDrawer());

    // Volume slider - use passive event
    this.volumeSlider.addEventListener('input', (e) => {
      const val = parseInt((e.target as HTMLInputElement).value);
      this.audio.volume = val / 100;
      this.volumeValue.textContent = val + '%';
    }, { passive: true });

    // Sleep timer presets - event delegation
    this.sleepDrawer.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const preset = target.closest('.sleep-preset') as HTMLElement | null;
      if (preset) {
        const min = parseInt(preset.dataset.min!);
        this.setSleepTimer(min);
      }
      if (target.closest('#btn-cancel-sleep')) {
        this.cancelSleepTimer();
      }
    });

    // Side nav - event delegation
    this.sideNav.addEventListener('click', (e) => {
      const item = (e.target as HTMLElement).closest('.nav-item') as HTMLElement | null;
      if (item && item.dataset.view) {
        this.switchView(item.dataset.view);
      }
    });

    // Playlist - event delegation
    this.playlistList.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const favBtn = target.closest('.fav-btn') as HTMLElement | null;
      if (favBtn) {
        e.stopPropagation();
        const index = parseInt(favBtn.dataset.favIndex!);
        this.toggleFavorite(this.playlist[index].id);
        return;
      }
      const item = target.closest('.playlist-item') as HTMLElement | null;
      if (item) {
        const index = parseInt(item.dataset.index!);
        this.currentIndex = index;
        this.loadTrack(this.playlist[index]);
        this.play();
      }
    });

    // Theme options - event delegation on theme drawer
    this.themeDrawer.addEventListener('click', (e) => {
      const option = (e.target as HTMLElement).closest('.theme-option') as HTMLElement | null;
      if (option && option.dataset.theme) {
        this.setTheme(option.dataset.theme);
      }
    });

    // Preset buttons - event delegation
    document.querySelector('.drawer-content')?.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('.preset-btn') as HTMLElement | null;
      if (btn && !btn.classList.contains('sleep-preset')) {
        const section = btn.closest('.eq-section');
        if (section) {
          section.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        }
        btn.classList.add('active');
      }
    });

    // Note drawer events
    this.btnSaveNote.addEventListener('click', () => this.saveNote());
    this.btnDeleteNote.addEventListener('click', () => this.deleteNote());

    document.addEventListener('keydown', (e) => this.handleKeyboard(e));

    // Clean up RAF on page hide
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    });
  }

  // --- Playlist Persistence ---
  private async getAppDataDir(): Promise<string> {
    if (!isTauri()) return '';
    const { appDataDir } = await import('@tauri-apps/api/path');
    return await appDataDir();
  }

  private async savePlaylistToDisk(): Promise<void> {
    if (!isTauri()) return;
    try {
      const { writeTextFile, mkdir } = await import('@tauri-apps/plugin-fs');
      const { appDataDir } = await import('@tauri-apps/api/path');
      const dir = await appDataDir();
      await mkdir(dir, { recursive: true });

      const data: SavedPlaylist = {
        tracks: this.playlist.map(t => ({
          id: t.id,
          title: t.title,
          artist: t.artist,
          duration: t.duration,
          filePath: t.filePath || ''
        })),
        currentIndex: this.currentIndex
      };

      await writeTextFile(`${dir}/playlist.json`, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('Failed to save playlist:', e);
    }
  }

  private async loadPlaylistFromDisk(): Promise<void> {
    if (!isTauri()) return;
    try {
      const { readTextFile } = await import('@tauri-apps/plugin-fs');
      const { appDataDir } = await import('@tauri-apps/api/path');
      const dir = await appDataDir();

      const content = await readTextFile(`${dir}/playlist.json`);
      const data: SavedPlaylist = JSON.parse(content);

      if (data.tracks && data.tracks.length > 0) {
        for (const t of data.tracks) {
          if (!t.filePath) continue;
          try {
            const { readFile } = await import('@tauri-apps/plugin-fs');
            const fileData = await readFile(t.filePath);
            const blob = new Blob([fileData]);
            const url = URL.createObjectURL(blob);

            this.playlist.push({
              id: t.id,
              title: t.title,
              artist: t.artist,
              duration: t.duration,
              url: url,
              filePath: t.filePath
            });
          } catch (e) {
            console.log('Failed to load track:', t.filePath);
          }
        }

        this.currentIndex = data.currentIndex >= 0 && data.currentIndex < this.playlist.length
          ? data.currentIndex : -1;

        this.updatePlaylistUI();

        if (this.currentIndex >= 0) {
          this.loadTrack(this.playlist[this.currentIndex]);
        }
      }
    } catch (e) {
      console.log('No saved playlist found or failed to load');
    }
  }

  // --- Folder Scan ---
  private async scanFolder(): Promise<void> {
    if (!isTauri()) {
      alert('文件夹扫描需要在桌面应用中使用');
      return;
    }

    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const folder = await open({
        directory: true,
        multiple: false
      });

      if (!folder || typeof folder !== 'string') return;

      await this.scanDirectory(folder);
    } catch (e) {
      console.error('Folder scan error:', e);
    }
  }

  private async scanDirectory(dirPath: string): Promise<void> {
    try {
      const { readDir } = await import('@tauri-apps/plugin-fs');
      const entries = await readDir(dirPath);
      const musicExts = ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a', '.wma'];
      let addedCount = 0;

      for (const entry of entries) {
        const entryPath = `${dirPath}\\${entry.name}`;

        if (entry.isDirectory) {
          await this.scanDirectory(entryPath);
        } else if (entry.isFile) {
          const ext = entry.name.slice(entry.name.lastIndexOf('.')).toLowerCase();
          if (musicExts.includes(ext)) {
            const existing = this.playlist.find(t => t.filePath === entryPath);
            if (!existing) {
              const fileName = entry.name.replace(/\.[^/.]+$/, '');
              this.playlist.push({
                id: Date.now() + Math.random(),
                title: fileName,
                artist: '本地音乐',
                duration: 0,
                url: '',
                filePath: entryPath
              });
              addedCount++;
            }
          }
        }
      }

      if (addedCount > 0) {
        this.updatePlaylistUI();
        await this.savePlaylistToDisk();

        if (this.currentIndex === -1 && this.playlist.length > 0) {
          this.currentIndex = 0;
          await this.loadTrackFile(this.playlist[0]);
          this.play();
        }
      }
    } catch (e) {
      console.error('Scan directory error:', e);
    }
  }

  private async loadTrackFile(track: Track): Promise<void> {
    if (!track.filePath) return;
    try {
      const { readFile } = await import('@tauri-apps/plugin-fs');
      const fileData = await readFile(track.filePath);
      const blob = new Blob([fileData]);
      track.url = URL.createObjectURL(blob);
      this.loadTrack(track);
    } catch (e) {
      console.error('Failed to load track file:', track.filePath);
    }
  }

  // --- View Switching ---
  private switchView(view: string): void {
    this.currentView = view;
    this.sideNav.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', (item as HTMLElement).dataset.view === view);
    });
    this.updatePlaylistUI();
  }

  // --- Notes ---
  private loadNotes(): void {
    try {
      const saved = localStorage.getItem('music-notes');
      if (saved) {
        this.notes = JSON.parse(saved);
      }
    } catch (e) {
      this.notes = [];
    }
  }

  private saveNotes(): void {
    localStorage.setItem('music-notes', JSON.stringify(this.notes));
  }

  private getNoteForTrack(trackId: number | null): Note | undefined {
    if (!trackId) return undefined;
    return this.notes.find(n => n.trackId === trackId);
  }

  private openNoteDrawer(noteId?: number): void {
    this.editingNoteId = noteId || null;
    const track = this.currentIndex >= 0 ? this.playlist[this.currentIndex] : null;

    if (noteId) {
      const note = this.notes.find(n => n.id === noteId);
      if (note) {
        this.noteDrawerTitle.textContent = '编辑笔记';
        this.noteSongInfo.textContent = note.trackTitle || '未关联歌曲';
        this.noteTextarea.value = note.content;
        this.btnDeleteNote.style.display = 'block';
      }
    } else {
      this.noteDrawerTitle.textContent = '写笔记';
      this.noteSongInfo.textContent = track ? `${track.title} - ${track.artist}` : '未选择歌曲';
      this.noteTextarea.value = '';
      this.btnDeleteNote.style.display = 'none';

      if (track) {
        const existing = this.getNoteForTrack(track.id);
        if (existing) {
          this.noteTextarea.value = existing.content;
          this.editingNoteId = existing.id;
          this.btnDeleteNote.style.display = 'block';
        }
      }
    }

    this.noteDrawer.classList.add('show');
    this.overlay.classList.add('show');
  }

  private hideNoteDrawer(): void {
    this.noteDrawer.classList.remove('show');
    this.overlay.classList.remove('show');
    this.editingNoteId = null;
  }

  private saveNote(): void {
    const content = this.noteTextarea.value.trim();
    if (!content) {
      this.hideNoteDrawer();
      return;
    }

    const track = this.currentIndex >= 0 ? this.playlist[this.currentIndex] : null;
    const now = Date.now();

    if (this.editingNoteId) {
      const idx = this.notes.findIndex(n => n.id === this.editingNoteId);
      if (idx >= 0) {
        this.notes[idx].content = content;
        this.notes[idx].updatedAt = now;
        if (track) {
          this.notes[idx].trackId = track.id;
          this.notes[idx].trackTitle = track.title;
        }
      }
    } else {
      const note: Note = {
        id: now,
        trackId: track ? track.id : null,
        trackTitle: track ? track.title : '未关联歌曲',
        content,
        createdAt: now,
        updatedAt: now
      };
      this.notes.unshift(note);
    }

    this.saveNotes();
    this.hideNoteDrawer();
    if (this.currentView === 'notes') {
      this.updatePlaylistUI();
    }
  }

  private deleteNote(): void {
    if (!this.editingNoteId) return;
    const idx = this.notes.findIndex(n => n.id === this.editingNoteId);
    if (idx >= 0) {
      this.notes.splice(idx, 1);
      this.saveNotes();
    }
    this.hideNoteDrawer();
    if (this.currentView === 'notes') {
      this.updatePlaylistUI();
    }
  }

  private formatDate(timestamp: number): string {
    const d = new Date(timestamp);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  // --- Favorites ---
  private loadFavorites(): void {
    try {
      const saved = localStorage.getItem('music-favorites');
      if (saved) {
        this.favorites = JSON.parse(saved);
      }
    } catch (e) {
      this.favorites = [];
    }
  }

  private saveFavorites(): void {
    localStorage.setItem('music-favorites', JSON.stringify(this.favorites));
  }

  private isFavorited(trackId: number): boolean {
    return this.favorites.includes(trackId);
  }

  private toggleFavorite(trackId: number): void {
    const idx = this.favorites.indexOf(trackId);
    if (idx >= 0) {
      this.favorites.splice(idx, 1);
    } else {
      this.favorites.push(trackId);
    }
    this.saveFavorites();
    this.updatePlaylistUI();
    this.updateFavoriteButton();
  }

  private toggleFavoriteCurrent(): void {
    if (this.currentIndex < 0 || !this.playlist[this.currentIndex]) return;
    const track = this.playlist[this.currentIndex];
    this.toggleFavorite(track.id);
  }

  private updateFavoriteButton(): void {
    if (this.currentIndex < 0 || !this.playlist[this.currentIndex]) {
      this.btnFavoriteToggle.classList.remove('favorited');
      return;
    }
    const track = this.playlist[this.currentIndex];
    this.btnFavoriteToggle.classList.toggle('favorited', this.isFavorited(track.id));
  }

  // --- Sleep Timer ---
  private setSleepTimer(minutes: number): void {
    this.cancelSleepTimer();
    this.sleepEndTime = Date.now() + minutes * 60 * 1000;
    this.sleepTimerId = window.setInterval(() => {
      if (!this.sleepEndTime) return;
      const remaining = Math.ceil((this.sleepEndTime - Date.now()) / 1000);
      if (remaining <= 0) {
        this.pause();
        this.cancelSleepTimer();
        this.sleepStatus.textContent = '已停止播放';
      } else {
        const m = Math.floor(remaining / 60);
        const s = remaining % 60;
        this.sleepStatus.textContent = `剩余 ${m}:${s.toString().padStart(2, '0')}`;
      }
    }, 1000);
    this.sleepStatus.textContent = `已设置 ${minutes} 分钟`;
    this.btnCancelSleep.style.display = 'inline-block';
  }

  private cancelSleepTimer(): void {
    if (this.sleepTimerId) {
      clearInterval(this.sleepTimerId);
      this.sleepTimerId = null;
    }
    this.sleepEndTime = null;
    this.sleepStatus.textContent = '未设置定时';
    this.btnCancelSleep.style.display = 'none';
  }

  // --- Volume ---
  private showVolumeDrawer(): void {
    this.volumeDrawer.classList.add('show');
    this.overlay.classList.add('show');
  }

  private hideVolumeDrawer(): void {
    this.volumeDrawer.classList.remove('show');
    this.overlay.classList.remove('show');
  }

  // --- Sleep ---
  private showSleepDrawer(): void {
    this.sleepDrawer.classList.add('show');
    this.overlay.classList.add('show');
  }

  private hideSleepDrawer(): void {
    this.sleepDrawer.classList.remove('show');
    this.overlay.classList.remove('show');
  }

  // --- Theme ---
  private showThemeDrawer(): void {
    this.themeDrawer.classList.add('show');
    this.overlay.classList.add('show');
  }

  private hideThemeDrawer(): void {
    this.themeDrawer.classList.remove('show');
    this.overlay.classList.remove('show');
  }

  // --- Expand / Collapse ---
  private async expand(): Promise<void> {
    if (this.isExpanded) return;
    this.isExpanded = true;
    this.triFold.classList.add('expanded');
    if (isTauri()) {
      await this.resizeWindow(1060, 760);
    }
  }

  private async collapse(): Promise<void> {
    if (!this.isExpanded) return;
    this.isExpanded = false;
    this.triFold.classList.remove('expanded');
    if (isTauri()) {
      await this.resizeWindow(380, 760);
    }
  }

  private async resizeWindow(width: number, height: number): Promise<void> {
    if (!isTauri()) return;
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('resize_window', { width, height });
    } catch (e) {
      console.error('Window resize via invoke failed:', e);
    }
  }

  private async closeWindow(): Promise<void> {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const win = getCurrentWindow();
      await win.close();
    } catch (e) {
      console.log('Close not available in browser');
    }
  }

  private async minimizeWindow(): Promise<void> {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const win = getCurrentWindow();
      await win.minimize();
    } catch (e) {
      console.log('Minimize not available in browser');
    }
  }

  private async maximizeWindow(): Promise<void> {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const win = getCurrentWindow();
      const isMaximized = await win.isMaximized();
      if (isMaximized) {
        await win.unmaximize();
      } else {
        await win.maximize();
      }
    } catch (e) {
      console.log('Maximize not available in browser');
    }
  }

  private toggleDropdown(): void {
    const isShown = this.dropdownMenu.classList.contains('show');
    if (isShown) {
      this.hideDropdown();
    } else {
      this.dropdownMenu.classList.add('show');
    }
  }

  private hideDropdown(): void {
    this.dropdownMenu.classList.remove('show');
  }

  private showEqDrawer(): void {
    this.eqDrawer.classList.add('show');
    this.overlay.classList.add('show');
  }

  private hideEqDrawer(): void {
    this.eqDrawer.classList.remove('show');
    this.overlay.classList.remove('show');
  }

  private togglePlay(): void {
    if (this.playlist.length === 0) {
      this.openFileDialog();
      return;
    }
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  private async play(): Promise<void> {
    if (this.currentIndex === -1 && this.playlist.length > 0) {
      this.currentIndex = 0;
      await this.loadTrackFile(this.playlist[0]);
    }

    if (!this.playlist[this.currentIndex]?.url) {
      await this.loadTrackFile(this.playlist[this.currentIndex]);
    }

    this.audio.play().then(() => {
      this.isPlaying = true;
      this.updatePlayButton();
      this.albumArt.classList.add('playing');
      this.vinylGrooves.classList.add('playing');
    }).catch(err => {
      console.error('Playback error:', err);
    });
  }

  private pause(): void {
    this.audio.pause();
    this.isPlaying = false;
    this.updatePlayButton();
    this.albumArt.classList.remove('playing');
    this.vinylGrooves.classList.remove('playing');
  }

  private updatePlayButton(): void {
    const isPlaying = this.isPlaying;
    this.iconPlay.style.display = isPlaying ? 'none' : 'block';
    this.iconPause.style.display = isPlaying ? 'block' : 'none';
    this.fullIconPlay.style.display = isPlaying ? 'none' : 'block';
    this.fullIconPause.style.display = isPlaying ? 'block' : 'none';
  }

  private async prevTrack(): Promise<void> {
    if (this.playlist.length === 0) return;
    if (this.shuffle) {
      this.currentIndex = Math.floor(Math.random() * this.playlist.length);
    } else {
      this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    }
    await this.loadTrackFile(this.playlist[this.currentIndex]);
    if (this.isPlaying) {
      this.play();
    }
  }

  private async nextTrack(): Promise<void> {
    if (this.playlist.length === 0) return;
    if (this.shuffle) {
      this.currentIndex = Math.floor(Math.random() * this.playlist.length);
    } else {
      this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    }
    await this.loadTrackFile(this.playlist[this.currentIndex]);
    if (this.isPlaying) {
      this.play();
    }
  }

  private loadTrack(track: Track): void {
    this.audio.src = track.url;
    this.trackTitle.textContent = track.title;
    this.trackArtist.textContent = track.artist;
    this.fullTrackTitle.textContent = track.title;
    this.fullTrackArtist.textContent = track.artist;
    this.lyricsTrackTitle.textContent = track.title;
    this.lyricsTrackArtist.textContent = track.artist;
    this.updatePlaylistUI();
    this.updateFavoriteButton();
    this.tryLoadLyrics(track);
  }

  private async tryLoadLyrics(track: Track): Promise<void> {
    this.hasRealLyrics = false;
    this.lyrics = [];
    this.currentLyricIndex = -1;

    if (!track.filePath) {
      this.showNoLyrics();
      return;
    }

    try {
      const lrcPath = track.filePath.replace(/\.[^/.\\]+$/, '.lrc');

      if (isTauri()) {
        try {
          const { readTextFile } = await import('@tauri-apps/plugin-fs');
          const lrcText = await readTextFile(lrcPath);
          this.parseLrc(lrcText);
          if (this.lyrics.length > 0) {
            this.hasRealLyrics = true;
          }
        } catch (e: any) {
          // Silently fail
        }
      }

      if (!this.hasRealLyrics) {
        try {
          const { readFile } = await import('@tauri-apps/plugin-fs');
          const fileData = await readFile(lrcPath);
          const decoder = new TextDecoder('utf-8');
          const lrcText = decoder.decode(fileData);
          this.parseLrc(lrcText);
          if (this.lyrics.length > 0) {
            this.hasRealLyrics = true;
          }
        } catch (e: any) {
          // Silently fail
        }
      }
    } catch (e: any) {
      // Silently fail
    }

    if (!this.hasRealLyrics) {
      this.showNoLyrics();
    } else {
      this.renderLyrics();
    }
  }

  private parseLrc(lrcText: string): void {
    this.lyrics = [];
    const lines = lrcText.split('\n');
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;

    for (const line of lines) {
      const match = line.match(timeRegex);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const millis = parseInt(match[3].padEnd(3, '0'));
        const text = match[4].trim();
        if (text) {
          this.lyrics.push({
            time: minutes * 60 + seconds + millis / 1000,
            text
          });
        }
      }
    }

    this.lyrics.sort((a, b) => a.time - b.time);
  }

  private showNoLyrics(): void {
    this.lyricsContent.innerHTML = `
      <div class="lyrics-empty">
        <svg viewBox="0 0 24 24" width="48" height="48"><path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
        <p>暂无歌词</p>
        <span>该歌曲暂无歌词信息</span>
      </div>
    `;
  }

  // PERFORMANCE: Throttled timeupdate using RAF
  private onTimeUpdate(): void {
    if (this.rafId) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      const now = performance.now();

      // Throttle progress updates to ~30fps
      if (now - this.lastProgressUpdate > 33) {
        this.lastProgressUpdate = now;
        this.updateProgress();
      }

      // Throttle lyric updates to ~10fps
      if (this.hasRealLyrics && now - this.lastLyricUpdate > 100) {
        this.lastLyricUpdate = now;
        this.updateLyrics(this.audio.currentTime);
      }
    });
  }

  private updateProgress(): void {
    const current = this.audio.currentTime;
    const total = this.audio.duration || 0;
    const percent = total > 0 ? (current / total) * 100 : 0;

    this.progressFill.style.width = `${percent}%`;
    this.progressHandle.style.left = `${percent}%`;
    this.fullProgressFill.style.width = `${percent}%`;
    this.fullProgressHandle.style.left = `${percent}%`;

    const timeStr = this.formatTime(current);
    this.currentTimeEl.textContent = timeStr;
    this.fullCurrentTimeEl.textContent = timeStr;
  }

  private onMetadataLoaded(): void {
    const total = this.audio.duration || 0;
    const timeStr = this.formatTime(total);
    this.totalTimeEl.textContent = timeStr;
    this.fullTotalTimeEl.textContent = timeStr;

    if (this.currentIndex >= 0 && this.playlist[this.currentIndex]) {
      this.playlist[this.currentIndex].duration = total;
      this.updatePlaylistUI();
    }
  }

  private onTrackEnded(): void {
    if (this.repeat) {
      this.audio.currentTime = 0;
      this.play();
    } else {
      this.nextTrack();
    }
  }

  private seek(e: MouseEvent, bar: HTMLElement): void {
    const rect = bar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const time = percent * (this.audio.duration || 0);
    this.audio.currentTime = time;
  }

  private toggleShuffle(): void {
    this.shuffle = !this.shuffle;
    const color = this.shuffle ? 'var(--primary)' : '';
    this.btnShuffle.style.color = color;
    this.btnFullShuffle.style.color = color;
  }

  private toggleRepeat(): void {
    this.repeat = !this.repeat;
    const color = this.repeat ? 'var(--primary)' : '';
    this.btnRepeat.style.color = color;
    this.btnFullRepeat.style.color = color;
  }

  private async openFileDialog(): Promise<void> {
    if (isTauri()) {
      try {
        const { open } = await import('@tauri-apps/plugin-dialog');
        const selected = await open({
          multiple: true,
          filters: [
            {
              name: '音乐文件',
              extensions: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma']
            }
          ]
        });

        if (selected && Array.isArray(selected)) {
          await this.loadFilesFromPaths(selected);
        }
      } catch (e) {
        console.error('Dialog error:', e);
        this.fileInput.click();
      }
    } else {
      this.fileInput.click();
    }
  }

  private async loadFilesFromPaths(paths: string[]): Promise<void> {
    const { readFile } = await import('@tauri-apps/plugin-fs');

    for (let i = 0; i < paths.length; i++) {
      const filePath = paths[i];
      const fileName = filePath.split(/[/\\]/).pop() || '未知文件';

      try {
        const fileData = await readFile(filePath);
        const blob = new Blob([fileData]);
        const url = URL.createObjectURL(blob);

        const track: Track = {
          id: Date.now() + i,
          title: fileName.replace(/\.[^/.]+$/, ''),
          artist: '本地音乐',
          duration: 0,
          url: url,
          filePath: filePath
        };
        this.playlist.push(track);
      } catch (e) {
        console.error('Failed to load file:', filePath, e);
      }
    }

    this.updatePlaylistUI();
    await this.savePlaylistToDisk();

    if (this.currentIndex === -1 && this.playlist.length > 0) {
      this.currentIndex = 0;
      this.loadTrack(this.playlist[0]);
      this.play();
    }
  }

  private handleFileSelect(e: Event): void {
    const files = (e.target as HTMLInputElement).files;
    if (!files) return;

    Array.from(files).forEach((file, index) => {
      const url = URL.createObjectURL(file);
      const track: Track = {
        id: Date.now() + index,
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: '本地音乐',
        duration: 0,
        url: url,
        filePath: undefined
      };
      this.playlist.push(track);
    });

    this.updatePlaylistUI();

    if (this.currentIndex === -1 && this.playlist.length > 0) {
      this.currentIndex = 0;
      this.loadTrack(this.playlist[0]);
      this.play();
    }
  }

  private updatePlaylistUI(): void {
    let displayTracks: Track[] = [];

    if (this.currentView === 'library') {
      displayTracks = this.playlist;
    } else if (this.currentView === 'favorites') {
      displayTracks = this.playlist.filter(t => this.isFavorited(t.id));
    }

    this.playlistCount.textContent = `${displayTracks.length} 首`;

    if (this.currentView === 'notes') {
      this.renderNotesView();
      return;
    }

    if (displayTracks.length === 0) {
      this.playlistList.innerHTML = `
        <div class="empty-playlist">
          <p>${this.currentView === 'favorites' ? '暂无收藏歌曲' : '暂无歌曲'}</p>
          ${this.currentView === 'library' ? '<button class="add-music-btn" id="btn-add-music-empty">添加本地音乐</button><button class="add-music-btn" id="btn-scan-folder-empty" style="margin-top:8px">扫描文件夹</button>' : ''}
        </div>
      `;
      document.getElementById('btn-add-music-empty')?.addEventListener('click', () => this.openFileDialog());
      document.getElementById('btn-scan-folder-empty')?.addEventListener('click', () => this.scanFolder());
      return;
    }

    // Use DocumentFragment for batch DOM insertion
    const fragment = document.createDocumentFragment();

    displayTracks.forEach((track, index) => {
      const playlistIndex = this.playlist.findIndex(t => t.id === track.id);
      const isActive = playlistIndex === this.currentIndex;
      const isFav = this.isFavorited(track.id);

      const item = document.createElement('div');
      item.className = `playlist-item ${isActive ? 'active' : ''}`;
      item.dataset.index = String(playlistIndex);
      item.innerHTML = `
        <span class="item-number">${index + 1}</span>
        <div class="item-info">
          <div class="item-title">${track.title}</div>
          <div class="item-artist">${track.artist}</div>
        </div>
        <span class="item-duration">${this.formatTime(track.duration)}</span>
        <button class="fav-btn ${isFav ? 'favorited' : ''}" data-fav-index="${playlistIndex}" title="${isFav ? '取消收藏' : '收藏'}">
          <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </button>
      `;
      fragment.appendChild(item);
    });

    this.playlistList.innerHTML = '';
    this.playlistList.appendChild(fragment);
  }

  private renderNotesView(): void {
    this.playlistCount.textContent = `${this.notes.length} 条`;

    if (this.notes.length === 0) {
      this.playlistList.innerHTML = `
        <div class="note-empty">
          <p>暂无笔记</p>
          <button class="add-music-btn" id="btn-add-note">写一条笔记</button>
        </div>
      `;
      document.getElementById('btn-add-note')?.addEventListener('click', () => this.openNoteDrawer());
      return;
    }

    const fragment = document.createDocumentFragment();

    this.notes.forEach(note => {
      const item = document.createElement('div');
      item.className = 'note-item';
      item.dataset.noteId = String(note.id);
      item.innerHTML = `
        <div class="note-item-title">${note.trackTitle || '未关联歌曲'}</div>
        <div class="note-item-preview">${note.content}</div>
        <div class="note-item-date">${this.formatDate(note.updatedAt)}</div>
      `;
      fragment.appendChild(item);
    });

    // Add "new note" button at top
    const headerBtn = document.createElement('div');
    headerBtn.style.padding = '0 4px 8px';
    headerBtn.innerHTML = `<button class="add-music-btn" id="btn-add-note-top" style="width:100%">+ 写新笔记</button>`;
    fragment.insertBefore(headerBtn, fragment.firstChild);

    this.playlistList.innerHTML = '';
    this.playlistList.appendChild(fragment);

    document.getElementById('btn-add-note-top')?.addEventListener('click', () => this.openNoteDrawer());

    // Bind click on note items
    this.playlistList.querySelectorAll('.note-item').forEach(item => {
      item.addEventListener('click', () => {
        const noteId = parseInt((item as HTMLElement).dataset.noteId!);
        this.openNoteDrawer(noteId);
      });
    });
  }

  private renderLyrics(): void {
    if (this.lyrics.length === 0) {
      this.showNoLyrics();
      return;
    }

    const fragment = document.createDocumentFragment();

    this.lyrics.forEach((line, index) => {
      const div = document.createElement('div');
      div.className = 'lyrics-line';
      div.dataset.index = String(index);
      div.textContent = line.text;
      fragment.appendChild(div);
    });

    this.lyricsContent.innerHTML = '';
    this.lyricsContent.appendChild(fragment);
  }

  // PERFORMANCE: Only update class, don't re-render entire lyrics
  private updateLyrics(currentTime: number): void {
    if (this.lyrics.length === 0) return;

    let newIndex = -1;
    for (let i = 0; i < this.lyrics.length; i++) {
      if (currentTime >= this.lyrics[i].time) {
        newIndex = i;
      } else {
        break;
      }
    }

    if (newIndex !== this.currentLyricIndex) {
      const prevLine = this.lyricsContent.querySelector(`.lyrics-line[data-index="${this.currentLyricIndex}"]`);
      if (prevLine) prevLine.classList.remove('active');

      this.currentLyricIndex = newIndex;

      const newLine = this.lyricsContent.querySelector(`.lyrics-line[data-index="${newIndex}"]`);
      if (newLine) {
        newLine.classList.add('active');
        newLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  private formatTime(seconds: number): string {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  private handleKeyboard(e: KeyboardEvent): void {
    switch (e.code) {
      case 'Space':
        e.preventDefault();
        this.togglePlay();
        break;
      case 'ArrowLeft':
        if (e.ctrlKey || e.metaKey) {
          this.prevTrack();
        }
        break;
      case 'ArrowRight':
        if (e.ctrlKey || e.metaKey) {
          this.nextTrack();
        }
        break;
      case 'Escape':
        if (this.isExpanded) {
          this.collapse();
        }
        this.hideDropdown();
        this.hideEqDrawer();
        this.hideVolumeDrawer();
        this.hideSleepDrawer();
        this.hideNoteDrawer();
        this.hideThemeDrawer();
        break;
    }
  }

  private setTheme(theme: string): void {
    this.currentTheme = theme;
    document.querySelectorAll('.theme-option').forEach(opt => {
      const el = opt as HTMLElement;
      el.classList.toggle('active', el.dataset.theme === theme);
    });

    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }

    localStorage.setItem('theme', theme);
  }

  private loadTheme(): void {
    const saved = localStorage.getItem('theme') || 'light';
    this.setTheme(saved);
  }
}

// Initialize player when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new MusicPlayer();
});
