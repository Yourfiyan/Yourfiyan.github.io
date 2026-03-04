document.addEventListener('DOMContentLoaded', () => {
    const playlistContainer = document.getElementById('playlist-container');
    const currentSongTitle = document.getElementById('current-song-title');
    const playBtn = document.getElementById('play-btn');
    const mainPlayBtn = document.getElementById('main-play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressBar = document.getElementById('progress-bar');
    const progressContainer = document.getElementById('progress-container');
    const currentTimeEl = document.getElementById('current-time');
    const totalDurationEl = document.getElementById('total-duration');
    const volumeContainer = document.getElementById('volume-container');
    const volumeBar = document.getElementById('volume-bar');
    const songCountEl = document.getElementById('song-count');

    let songs = [];
    let currentSongIndex = -1;
    let isPlaying = false;
    const audio = new Audio();
    audio.volume = 1.0; // Default volume

    // Fetch music list
    fetch('get_music.php')
        .then(response => response.json())
        .then(data => {
            songs = data;
            if(songCountEl) songCountEl.textContent = `${songs.length} songs`;
            renderPlaylist();
        })
        .catch(error => {
            console.error('Error fetching music:', error);
            playlistContainer.innerHTML = '<div style="padding:20px; text-align:center;">No music found or error loading.</div>';
        });

    function renderPlaylist() {
        playlistContainer.innerHTML = '';
        if (songs.length === 0) {
            playlistContainer.innerHTML = '<div style="padding:20px; text-align:center;">No .mp3 files found in /music folder.</div>';
            return;
        }

        songs.forEach((song, index) => {
            const item = document.createElement('div');
            item.classList.add('song-item');
            item.dataset.index = index;
            
            // Generate a fake date for "Date Added"
            const date = new Date();
            date.setDate(date.getDate() - index); // Just to make them different
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            item.innerHTML = `
                <div class="col-number">
                    <span class="index-num">${index + 1}</span>
                    <i class="fas fa-play play-icon" style="display:none; font-size: 12px;"></i>
                </div>
                <div class="col-title">${song.name}</div>
                <div class="col-album">${dateStr}</div>
                <div class="col-duration">--:--</div>
            `;
            item.addEventListener('click', () => playSong(index));
            playlistContainer.appendChild(item);
        });
    }

    function playSong(index) {
        if (index < 0 || index >= songs.length) return;

        currentSongIndex = index;
        const song = songs[currentSongIndex];
        
        // Update Audio Source
        audio.src = song.path;
        audio.load();
        
        // Update UI
        currentSongTitle.textContent = song.name;
        updateActiveSongInList();
        
        // Play
        playAudio();
    }

    function playAudio() {
        audio.play().then(() => {
            isPlaying = true;
            updatePlayButton();
        }).catch(e => console.error("Playback failed", e));
    }

    function pauseAudio() {
        audio.pause();
        isPlaying = false;
        updatePlayButton();
    }

    function togglePlay() {
        if (currentSongIndex === -1 && songs.length > 0) {
            playSong(0);
        } else if (isPlaying) {
            pauseAudio();
        } else {
            playAudio();
        }
    }

    function playNext() {
        let nextIndex = currentSongIndex + 1;
        if (nextIndex >= songs.length) {
            nextIndex = 0; // Loop back to start
        }
        playSong(nextIndex);
    }

    function playPrev() {
        let prevIndex = currentSongIndex - 1;
        if (prevIndex < 0) {
            prevIndex = songs.length - 1; // Loop to end
        }
        playSong(prevIndex);
    }

    function updatePlayButton() {
        const icon = playBtn.querySelector('i');
        const mainIcon = mainPlayBtn.querySelector('i');
        
        if (isPlaying) {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
            
            mainIcon.classList.remove('fa-play');
            mainIcon.classList.add('fa-pause');
        } else {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
            
            mainIcon.classList.remove('fa-pause');
            mainIcon.classList.add('fa-play');
        }
    }

    function updateActiveSongInList() {
        const items = document.querySelectorAll('.song-item');
        items.forEach(item => {
            item.classList.remove('active');
            const numSpan = item.querySelector('.index-num');
            const playIcon = item.querySelector('.play-icon');
            if(numSpan) numSpan.style.display = 'block';
            if(playIcon) playIcon.style.display = 'none';
        });
        
        if (currentSongIndex !== -1) {
            const activeItem = document.querySelector(`.song-item[data-index="${currentSongIndex}"]`);
            if (activeItem) {
                activeItem.classList.add('active');
                // Show play icon instead of number for active song
                const numSpan = activeItem.querySelector('.index-num');
                const playIcon = activeItem.querySelector('.play-icon');
                if(numSpan) numSpan.style.display = 'none';
                if(playIcon) playIcon.style.display = 'block';
            }
        }
    }

    function formatTime(seconds) {
        if(isNaN(seconds)) return "0:00";
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' + sec : sec}`;
    }

    function updateProgress(e) {
        const { duration, currentTime } = e.srcElement;
        if (isNaN(duration)) return;
        
        const progressPercent = (currentTime / duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
        
        currentTimeEl.textContent = formatTime(currentTime);
        totalDurationEl.textContent = formatTime(duration);
    }

    function setProgress(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        if (isNaN(duration)) return;
        
        audio.currentTime = (clickX / width) * duration;
    }

    function setVolume(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const volume = clickX / width;
        
        audio.volume = Math.max(0, Math.min(1, volume));
        volumeBar.style.width = `${audio.volume * 100}%`;
    }

    // Event Listeners
    playBtn.addEventListener('click', togglePlay);
    mainPlayBtn.addEventListener('click', togglePlay);
    nextBtn.addEventListener('click', playNext);
    prevBtn.addEventListener('click', playPrev);
    
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', playNext);
    audio.addEventListener('loadedmetadata', () => {
        totalDurationEl.textContent = formatTime(audio.duration);
    });
    
    progressContainer.addEventListener('click', setProgress);
    volumeContainer.addEventListener('click', setVolume);
});