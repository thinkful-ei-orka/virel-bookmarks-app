import store from './store.js';
import api from './api.js';

function generateStar(rating){
    let whitestar = 5 - rating;
    let stars = [];
    for(let i=0;i<rating;i++){
        stars.push('&#9733');
    }
    for(let i=0;i<whitestar;i++){
        stars.push('&#9734');
    }
    stars = stars.join(' ');
    return stars
}

function render(){
    renderError();
    let items = [...store.items];
    if(store.filter > 0){
        items = items.filter(item =>  store.filter == item.rating);
    }
    
    const bookmarkListItemsString = generateBookmarkItemsString(items);

    $('.bookmarksList').html(bookmarkListItemsString);
    
}

function generateItemElement(item){
    let stars = generateStar(item.rating)
    return `<li class="js-expand" id="${item.id}">
    <p class="expand2">${item.title}<span>${stars}</span></p>
    </li>`
}

const generateBookmarkItemsString = function (bookmarks) {
    const bookmarksAll = bookmarks.map((bookmark) =>{
        if (bookmark.expanded === false) {
            return generateItemElement(bookmark)
        }
        else{
            return liString(bookmark)
        }
    });
    return bookmarksAll.join('');
};

function liString(item){
    return `<li class="js-list-item" id="${item.id}">
    <p class="bookmarkTitle expand"><span class="js-expand2">${item.title}</span> <button id="${item.id}" class="js-delete">&#128465</button></p>
    <div class="expand"><button class="visit" alt='visit bookmark button' type='button'>visit site</button> ${item.rating} ★</div>
    <p class="description expand"> ${item.desc} </p></li>`
}

const generateError = function (message) {
    return `
        <section class="error-content">
          <button id="cancel-error">X</button>
          <p>${message}</p>
        </section>
      `;
};
  
const renderError = function () {
    if (store.error) {
      const el = generateError(store.error);
      $('.error-container').html(el);
    } else {
      $('.error-container').empty();
    }
};
  
const handleCloseError = function () {
    $('.error-container').on('click', '#cancel-error', () => {
      store.setError(null);
      renderError();
    });
};

function filterD(){
    $('select').on('change', function() {
        store.filter = parseInt(this.value);
        console.log(store.filter);
        render();
        return this.value 
    })
}

function newBookmarkClick(){
    $('.newBookmark').click(function(){
        $('section').addClass('hidden');
        $('main').append(
            `<form id="js-form">
            <label for="url">Add new bookmark:</label><br>
            <input id="url" type="text" name="inputUrl" class="inputUrl" placeholder="https://www.example.com/" required><br><br>
            
            <div class="div">
                <label for="title">Add new title:</label><br>
                <input id="title" type="text" name="inputTitle" class="inputTitle" placeholder="Title" required>
                
                <ul class="rating">
                    <li>
                        Rating
                    </li>
                    <li>
                        <input type="radio" id="5" name="star" value="5" class="radio_input" required>
                        <label for="5">5 ★</label>
                    </li>
                    <li>
                        <input type="radio" id="4" name="star" value="4" class="radio_input" required>
                        <label for="4">4 ★</label>
                    </li>
                    <li>
                        <input type="radio" id="3" name="star" value="3" class="radio_input" required>
                        <label for="3">3 ★</label>
                    </li>
                    <li>
                        <input type="radio" id="2" name="star" value="5" class="radio_input" required>
                        <label for="2">2 ★</label>
                    </li>
                    <li>
                        <input type="radio" id="1" name="star" value="1" class="radio_input" required>
                        <label for="1">1 ★</label>
                    </li>
                </ul>
                <label for="description">Add Description:</label><br>
                <textarea id="description" name="description" required rows="10" cols="40" placeholder="Add a description" ></textarea>
            </div>
            <div class="containerBtn">
                <button id="Cancel" class="button" type="reset">Cancel</button>
                <button id="submitBtn" class="button" type="submit">Create</button>
            </div>
        </form>`
        );
    })
}

function handleCancel(){
    $('main').on('click','#Cancel', function (event) {
        event.preventDefault();
        $('#js-form').remove();
        $('section').removeClass('hidden');
    })
}

function handleNewItemSubmit(){
    $('main').on('submit','#js-form', function (event) {
        event.preventDefault();
        const newItemUrl = $('.inputUrl').val();
        $('.inputUrl').val("");
        const newItemTitle = $('.inputTitle').val();
        $('.inputTitle').val("");
        const newItemRating = $('input:radio[name=star]:checked').val();
        const newItemDescription = $('textarea').val();
        $('textarea').val("");
        api.createItem(newItemTitle,newItemUrl,newItemDescription,newItemRating)
            .then((newItem) => {
                newItem.expanded = false;
                store.addItem(newItem);
                console.log(newItem);
                console.log(store.items);
                $('#js-form').remove();
                $('section').removeClass('hidden');
                render();
            })
            .catch(err => {
                store.setError(err.message);
                render();
            });
    });
  };

function getItemIdFromElement(item){
    return $(item).closest('.js-list-item').attr('id')
      
};

function handleItemExpansion() {
    $('.bookmarksList').on('click', '.js-expand', event => {
        console.log('hello');
        const id = event.currentTarget.id;
        console.log(id);
        for (let i=0;i<store.items.length;i++){
            if (store.items[i].id === id){
                store.items[i].expanded = !store.items[i].expanded
        
            }
        }
        store.error = null;
        store.adding = false;
        render();
    });
    $('.bookmarksList').on('click', '.js-expand2', event => {
        console.log('hello');
        console.log(event.currentTarget);
        const id2 = getItemIdFromElement(event.currentTarget);
        for (let i=0;i<store.items.length;i++){
            if (store.items[i].id === id2){
                store.items[i].expanded = !store.items[i].expanded
        
            }
        }
        store.error = null;
        store.adding = false;
        render();
    });
};

function handleDeleteItemClicked() {
    $('main').on('click', '.js-delete', event => {
        event.preventDefault();
        //const id = getItemIdFromParentElement(event.currentTarget);
        console.log(event.currentTarget.id);
        const id = event.currentTarget.id;
        console.log(id);
        api.deleteItem(id)
            .then(() => {
            store.findAndDelete(id);
            render();
            })
        .catch(err => {
            store.setError(err.message);
            render();
        });
    });
};



function bindEventListeners(){
    newBookmarkClick();
    handleNewItemSubmit();
    handleItemExpansion();
    handleDeleteItemClicked();
    handleCancel();
    handleCloseError();
    filterD();
}   
export default{
    bindEventListeners,
    render
}