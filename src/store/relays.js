import { defineStore } from 'pinia'
import { useUserStore } from '@/store/user'
// import { relays } from '../../relays.yaml'
// import { geo } from '../../relays.yaml'

export const useRelaysStore = defineStore('relays', {
  state: () => ({ 
    urls: new Array(),
    // results: new Object(),
    geo: new Object(),
    lastUpdate: null,
    count: new Object(),
    processing: false,
    processedRelays: new Set(),
    favorites: new Array(),
    aggregates: {},
    aggregatesAreSet: false,
    cached: new Object(),
    canonicals: new Object()
  }),
  getters: {
    getAll: (state) => state.urls,
    getShuffled: state => shuffle(state.urls),
    getShuffledPublic: state => {
      console.log('aggregates are set',state.aggregatesAreSet )
      return state.aggregatesAreSet ? shuffle(state.aggregates.public) : shuffle(state.urls)
    },
    getRelays: (state) => (aggregate, results) => {
      if( 'all' == aggregate )
        return state.urls.map(x=>x)
      if( 'favorite' == aggregate )
        return state.favorites
      return state.urls.filter( (relay) => results?.[relay]?.aggregate == aggregate)
    },

    getByAggregate: state => aggregate => {
      const results = state.urls.filter( (relay) => state.results?.[relay]?.aggregate == aggregate)
      this.setAggregate(aggregate, results)
      return results
    },
    
    getGeo: state => relayUrl => state.geo[relayUrl],

    getLastUpdate: state => state.lastUpdate,

    getCount: state => type => state.count[type],
    getCounts: state => state.count,

    getAggregates: state => state.aggregates,
    getAggregate: state => which => state.aggregates[which],
    areAggregatesSet: state => state.aggregatesAreSet,

    getFavorites: state => state.favorites,
    isFavorite: state => relayUrl => state.favorites.includes(relayUrl),

    getAggregateCache: state => aggregate => state.cached[aggregate] instanceof Array ? state.cached[aggregate] : [],

    getCanonicals: state => state.canonicals,
    getCanonical: state => relay => state.canonicals[relay],
  },
  actions: {
    addRelay(relayUrl){ this.urls.push(relayUrl) },
    addRelays(relayUrls){ this.urls = Array.from(new Set(this.urls.concat(this.urls, relayUrls))) },
    setRelays(relayUrls){ this.urls = relayUrls },

    // setResult(result){ 
    //   // this.setStat('relays', this.)
    //   this.results[result.url] = result 
    // },
    // setResults(results){ this.results = results },
    // clearResults(){ this.results = {} },

    setGeo(geo){ this.geo = geo },

    setStat(type, value){ 
      this.count[type] = value 
    },

    setAggregate(aggregate, arr){ this.aggregates[aggregate] = arr },

    setAggregates(obj){ 
      this.aggregatesAreSet = true
      this.aggregates = obj 
    },
  
    setFavorite(relayUrl){ 
      if(this.favorites.includes(relayUrl))
        return
      this.favorites.push(relayUrl)
      this.favorites = this.favorites.map( x => x )
      
      const store = useUserStore()
      if(store.kind3[relayUrl] instanceof Object)
        return 
      store.kind3[relayUrl] = {
        read: false,
        write: false
      }
    },

    unsetFavorite(relayUrl){ 
      this.favorites = this.favorites.filter(item => item !== relayUrl)
      
      const store = useUserStore()
      console.log('before delete', typeof store.kind3[relayUrl])
      delete store.kind3[relayUrl]
      console.log('deleted?', typeof store.kind3[relayUrl])
    },

    toggleFavorite(relayUrl){
      ////console.log('toggle favorite', relayUrl)
      if( this.isFavorite(relayUrl) )
        this.unsetFavorite(relayUrl)
      else 
        this.setFavorite(relayUrl)
      return this.isFavorite(relayUrl)
    },

    setAggregateCache(aggregate, array){
      if( !(this.cached[aggregate] instanceof Array) )
        this.cached[aggregate] = new Array()
      this.cached[aggregate] = array
    },

    setCanonicals(c){
      this.canonicals = c
    }
  },
})

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}
