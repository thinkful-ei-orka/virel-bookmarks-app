import api from './api.js';
import store from './store.js';


import bookmarks from './bookmarks.js';

const main = function () {
  api.getItems()
  .then((items) => {
    items.forEach((item) =>{
      let element = {id:item.id, title:item.title, url:item.url, desc:item.desc, rating:item.rating, expanded: false}
      store.addItem(element)
      });
    bookmarks.render();
  });
  console.log(store.items);
  bookmarks.bindEventListeners();
  bookmarks.render();
};

$(main);
