import {
  ADD_TO_QUEUE,
  REMOVE_FROM_QUEUE,
  CLEAR_QUEUE,
  ADD_STREAMS_TO_QUEUE_ITEM,
  REPLACE_STREAMS_IN_QUEUE_ITEM,
  NEXT_SONG,
  PREVIOUS_SONG,
  SELECT_SONG,
  REPOSITION_SONG
} from '../actions/queue';

let _ = require('lodash');

const initialState = {
  queueItems: [],
  currentSong: 0
};

function findQueueItemIndex(queueItems, item) {
  return _.findIndex(queueItems, i => i.uuid === item.uuid);
}

function reduceAddToQueue(state, action) {
  return Object.assign({}, state, {
    queueItems: _.union(state.queueItems, [action.payload])
  });
}

function reduceRemoveFromQueue(state, action) {
  let removeIx, newQueue;
  let newCurrent = state.currentSong;
  removeIx = findQueueItemIndex(state.queueItems, action.payload);
  newQueue = _.cloneDeep(state.queueItems);
  newQueue = _.filter(newQueue, item => action.payload.uuid !== item.uuid);
  if (removeIx < state.currentSong) {
    newCurrent--;
  }
  return Object.assign({}, state, {
    queueItems: newQueue,
    currentSong: newCurrent
  });
}

function reduceClearQueue(state) {
  return Object.assign({}, state, {
    queueItems: []
  });
}

function reduceAddStreamsToQueueItem(state, action) {
  let replaceIx, newQueue;
  replaceIx = findQueueItemIndex(state.queueItems, action.payload);
  newQueue = _.cloneDeep(state.queueItems);
  newQueue[replaceIx] = Object.assign({}, newQueue[replaceIx], action.payload);

  return Object.assign({}, state, {
    queueItems: newQueue
  });
}

function reduceReplaceStreamsInQueueItem(state, action) {
  let replaceIx, newQueue;
  replaceIx = findQueueItemIndex(state.queueItems, action.payload);
  newQueue = _.cloneDeep(state.queueItems);
  newQueue[replaceIx] = action.payload;
  return Object.assign({}, state, {
    queueItems: newQueue
  });
}

function reduceSelectSong(state, action) {
  return Object.assign({}, state, {
    currentSong: action.payload
  });
}

function reduceRepositionSong(state, action) {
  let newQueue;
  newQueue = _.cloneDeep(state.queueItems);
  const [removed] = newQueue.splice(action.payload.itemFrom, 1);
  newQueue.splice(action.payload.itemTo, 0, removed);


  let newCurrentSong = state.currentSong;
  if (action.payload.itemFrom == state.currentSong) {
    newCurrentSong = action.payload.itemTo;
  } else if (action.payload.itemFrom < action.payload.itemTo) {
    // moving top to bottom and
    // current song is in between
    if (state.currentSong > action.payload.itemFrom && state.currentSong <= action.payload.itemTo) {
      newCurrentSong--;
    }
  } else if (action.payload.itemFrom > action.payload.itemTo) {
    // moving bottom to top
    // current song is in between
    if (state.currentSong < action.payload.itemFrom && state.currentSong >= action.payload.itemTo) {
      newCurrentSong++;
    }
  }
  // otherwise does not change

  return Object.assign({}, state, {
    currentSong: newCurrentSong,
    queueItems: newQueue
  });
}

function reduceNextSong(state) {
  return Object.assign({}, state, {
    currentSong: (state.currentSong + 1) % state.queueItems.length
  });
}

function reducePreviousSong(state) {
  return Object.assign({}, state, {
    currentSong:
      (((state.currentSong - 1) % state.queueItems.length) +
        state.queueItems.length) %
      state.queueItems.length
  });
}

export default function QueueReducer(state = initialState, action) {
  switch (action.type) {
  case ADD_TO_QUEUE:
    return reduceAddToQueue(state, action);
  case REMOVE_FROM_QUEUE:
    return reduceRemoveFromQueue(state, action);
  case CLEAR_QUEUE:
    return reduceClearQueue(state);
  case ADD_STREAMS_TO_QUEUE_ITEM:
    return reduceAddStreamsToQueueItem(state, action);
  case REPLACE_STREAMS_IN_QUEUE_ITEM:
    return reduceReplaceStreamsInQueueItem(state, action);
  case NEXT_SONG:
    return reduceNextSong(state);
  case PREVIOUS_SONG:
    return reducePreviousSong(state);
  case SELECT_SONG:
    return reduceSelectSong(state, action);
  case REPOSITION_SONG:
    return reduceRepositionSong(state, action);
  default:
    return state;
  }
}
