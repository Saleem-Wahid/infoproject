//Brandon Js
const APIEfoo = (function() {
    
    const clientId = '77413e7632024c3c81c379890c19253d';
    const clientSecret = 'ed4ff73df62844d8b0df62c5b9e3ad9d';

    // recieving token
    const _auth = async () => {

        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded', 
                'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();
        return data.access_token;
    }

    /* get genre then
    then get plalist of that genre
    then get tracks of that playlists
    then bring up a single track upon clicking*/
    
    //getting genres from spotify api endpoint.
    const gene_re = async (token) => {

        const result = await fetch(`https://api.spotify.com/v1/browse/categories?locale=sv_US`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        }); 

        const data = await result.json();
        return data.categories.items;
    }

    const playlist_of_genre = async (token, IDgenre) => {

        const limit = 10;
        
        const result = await fetch(`https://api.spotify.com/v1/browse/categories/${IDgenre}/playlists?limit=${limit}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
//        console.log(data);
        return data.playlists.items;
    }

    const Tracks_of_Playlist = async (token, GtracksAPIE) => {

        const limit = 100;

        const result = await fetch(`${GtracksAPIE}?limit=${limit}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data.items;
    }

    const Track_of_Tracks = async (token, OnetracksAPIE) => {

        const result = await fetch(`${OnetracksAPIE}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data;
    }

    return {
        auth() {
            return _auth();
        },
        genre(token) {
            return gene_re(token);
        },
        playlistofgenre(token, IDgenre) {
            return playlist_of_genre(token, IDgenre);
        },
        TracksofPlaylist(token, GtracksAPIE) {
            return Tracks_of_Playlist(token, GtracksAPIE);
        },
        TrackofTracks(token, OnetracksAPIE) {
            return Track_of_Tracks(token, OnetracksAPIE);
        }
    }
})(); //IIFE

const htmlAPIEPART = (function() {

    const DOMElements = {
        hfToken: '#toke',
        Pick_A_Genre: '#Pick_A_genre',
        Pick_A_Playlist: '#Pick_A_playlist',
        tracks: '.tracks_',
        SearchGP: '#searchit',
        Tracksinfo: '#tracdata'
    }

    return {

        inputField() {
            return {
                genre: document.querySelector(DOMElements.Pick_A_Genre),
                playlistingen: document.querySelector(DOMElements.Pick_A_Playlist),
                tracks: document.querySelector(DOMElements.tracks),
                search: document.querySelector(DOMElements.SearchGP),
                trackInFo: document.querySelector(DOMElements.Tracksinfo)
            }
        },

        Selectgenre(string, value) {
            const html = `<option value="${value}">${string}</option>`;
            document.querySelector(DOMElements.Pick_A_Genre).insertAdjacentHTML('beforeend', html);
        }, 

        SelectPlaylistOfGenre(string, value) {
            const html = `<option value="${value}">${string}</option>`;
            document.querySelector(DOMElements.Pick_A_Playlist).insertAdjacentHTML('beforeend', html);
        },

        SelectTrack(songIDEN, title) {
            const html = `<a href="#" class="list-group-item list-group-item-action list-group-item-light" id="${songIDEN}">${title}</a>`;
            document.querySelector(DOMElements.tracks).insertAdjacentHTML('beforeend', html);
        },

        SelecttrackINFO(image, title2, singer) {

            const detailDiv = document.querySelector(DOMElements.Tracksinfo);
            detailDiv.innerHTML = '';

            const html = 
            `
            <div class="row col-sm-12 px-0">
                <img src="${image}" height="250" width="250" alt="">        
            </div>
            <div class="row col-sm-12 px-0">
                <label for="Genre" class="form-label col-sm-12">${title2}:</label>
            </div>
            <div class="row col-sm-12 px-0">
                <label for="artist" class="form-label col-sm-12">By ${singer}:</label>
            </div> 
            `;

            detailDiv.insertAdjacentHTML('beforeend', html)
        },

        ShowTrackinfo() {
            this.inputField().trackInFo.innerHTML = '';
        },

        BlankTracks() {
            this.inputField().tracks.innerHTML = '';
            this.ShowTrackinfo();
        },

        resetPlaylist() {
            this.inputField().playlistingen.innerHTML = '';
            this.BlankTracks();
        },
        
        storeToken(value) {
            document.querySelector(DOMElements.hfToken).value = value;
        },

        getStoredToken() {
            return {
                token: document.querySelector(DOMElements.hfToken).value
            }
        }
    }

})();

const TT = (function(UICtrl, APICtrl) {

    const DOMInputs = UICtrl.inputField();
    const loadGenres = async () => {
        const token = await APICtrl.auth();           
        UICtrl.storeToken(token);
        const genres = await APICtrl.genre(token);
        genres.forEach(element => UICtrl.Selectgenre(element.name, element.id));
    }

    DOMInputs.genre.addEventListener('change', async () => {
        UICtrl.resetPlaylist();
        const token = UICtrl.getStoredToken().token;        
        const genreSelect = UICtrl.inputField().genre;       
        const genreId = genreSelect.options[genreSelect.selectedIndex].value;             
        const playlist = await APICtrl.playlistofgenre(token, genreId);       
        playlist.forEach(p => UICtrl.SelectPlaylistOfGenre(p.name, p.tracks.href));
    });
     

    DOMInputs.search.addEventListener('click', async (e) => {
        e.preventDefault();
        UICtrl.BlankTracks();
        const token = UICtrl.getStoredToken().token;        
        const playlistSelect = UICtrl.inputField().playlistingen;
        const tracksEndPoint = playlistSelect.options[playlistSelect.selectedIndex].value;
        const tracks = await APICtrl.TracksofPlaylist(token, tracksEndPoint);
        tracks.forEach(el => UICtrl.SelectTrack(el.track.href, el.track.name))
        
    });

    
    DOMInputs.tracks.addEventListener('click', async (e) => {
        e.preventDefault();
        UICtrl.ShowTrackinfo();
        const token = UICtrl.getStoredToken().token;
        const trackEndpoint = e.target.id;
        const track = await APICtrl.TrackofTracks(token, trackEndpoint);
        UICtrl.SelecttrackINFO(track.album.images[2].url, track.name, track.artists[0].name);
    });    

    return {
        init() {
            loadGenres();
        }
    }

})(htmlAPIEPART, APIEfoo);

TT.init();