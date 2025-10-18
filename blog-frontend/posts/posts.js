const showCreatorBtn = document.getElementById('showPopupBtn');
const closeCreatorBtn = document.getElementById('closeCreatorBtn');
const postCreatorContainer = document.getElementById('postCreator');
const formCreater = document.querySelector('#postCreator form');
const inputTitle = document.getElementById('inputTitle');
const inputDescription = document.getElementById('inputDescription');
const postViewerContainer = document.getElementById('postViewer');
const postTitle = document.getElementById('postTitle');
const postDescription = document.getElementById('postDescription');
const closeViewerBtn = document.getElementById('closeViewerBtn');
const postCreated = document.getElementById('postCreated');
const postUpdated = document.getElementById('postUpdated');
const deletePostBtn = document.getElementById('deletePostBtn');
const editPostBtn = document.getElementById('editPostBtn');
const postUpdaterContainer = document.getElementById('postUpdater');
const formUpdater = document.querySelector('#postUpdater form');
const inputTitleUpdater = document.getElementById('inputTitleUpdater');
const inputDescriptionUpdater = document.getElementById('inputDescriptionUpdater');
const closeUpdaterBtn = document.getElementById('closeUpdaterBtn');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageNumber = document.getElementById('pageNumber');
const inputTags = document.getElementById('inputTags');
const url = 'http://localhost:3000/posts';
let currentID = 1;


let currentPage = 1;
const limit = 9;
tags = [];


function setPagerState(meta) {
  if (!meta) return;

  pageNumber.textContent = meta.page;
  prevPageBtn.disabled = !meta.hasPrev;
  nextPageBtn.disabled = !meta.hasNext;
}

const fetchAllToDisplay = (page = 1) => {
  fetch(`${url}?page=${page}&limit=${limit}&tags=${tags.toString()}`)
    .then(response => response.json())
    .then(result => {
      const posts = Array.isArray(result) ? result : result.data;
      const meta = Array.isArray(result) ? null : result.meta;

      const container = document.getElementById('postsContainer');
      container.innerHTML = '';

      posts.forEach(post => {
        const col = document.createElement('div');
        col.className = 'col-md-4';

        col.innerHTML = `
          <div class="card bg-primary shadow-sm" style="width: 100%;">
            <img src="../assets/pictures/pastry.jpg" class="card-img-top" alt="Post image">
            <div class="card-body">
              <h5 class="card-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${post.title}</h5>
              <p class="card-text" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${post.description ?? 'Нет описания'}</p>
              <p class="text-muted small">Создано: ${new Date(post.createdAt).toLocaleString()}</p>
              <a class="btn btn-primary bg-55c8ff read-btn">Читать</a>
            </div>
          </div>
        `;
        container.appendChild(col);

        const readBtn = col.querySelector('.read-btn');
        readBtn.addEventListener('click', (e) => {
          e.preventDefault();
          postViewerContainer.style.display = 'flex';
          fetch(`${url}/${post.id}`)
            .then(r => r.json())
            .then(post => {
              postCreated.innerHTML = `Создано: ${new Date(post.createdAt).toLocaleString()}`;
              if (post.createdAt === post.updatedAt) {
                postUpdated.textContent = '';
              } else {
                postUpdated.textContent = `Обновлено: ${new Date(post.updatedAt).toLocaleString()}`;
              }
              postTitle.innerHTML = post.title;
              postDescription.innerHTML = post.description;
              currentID = post.id;
            });
        });
      });

      currentPage = page;
      if (meta) {
        setPagerState(meta);
      } else {
        setPagerState();
        if (posts.length < limit) nextPageBtn.disabled = true;
      }
    })
    .catch(err => console.error('Error loading posts:', err));
};

fetchAllToDisplay(currentPage);

prevPageBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    fetchAllToDisplay(currentPage - 1);
  }
});

nextPageBtn.addEventListener('click', () => {
  fetchAllToDisplay(currentPage + 1);
});

showCreatorBtn.addEventListener('click', () => {
  postCreatorContainer.style.display = 'flex';
});

inputTags.addEventListener('input', () => {
  tags = inputTags.value
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0);

});
inputTags.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault(); 
    fetchAllToDisplay();
  }
});

closeCreatorBtn.addEventListener('click', () => {
  postCreatorContainer.style.display = 'none';
  inputTitle.value = "";
  inputDescription.value = "";
});

closeViewerBtn.addEventListener('click', () => {
  postViewerContainer.style.display = 'none';
  postTitle.innerHTML = "";
  postDescription.innerHTML = "";
});

closeUpdaterBtn.addEventListener('click', () => {
  postUpdaterContainer.style.display = 'none';
})

deletePostBtn.addEventListener('click', () => {
  fetch(`${url}/${currentID}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
    .then(response => {
      if (response.ok) {
        console.log("Post deleted successfully!");

        postViewerContainer.style.display = 'none';
        postTitle.innerHTML = "";
        postDescription.innerHTML = "";
        fetchAllToDisplay();
      } else {
        console.error("Failed to delete post:", response.statusText);
      }
    })
})

editPostBtn.addEventListener('click', () => {

  fetch(`${url}/${currentID}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then(response => response.json())
    .then(response => {
      inputTitleUpdater.value = response.title;
      inputDescriptionUpdater.value = response.description;

      postUpdaterContainer.style.display = 'flex'

      postViewerContainer.style.display = 'none';
      postTitle.innerHTML = "";
      postDescription.innerHTML = "";
    })
})

formUpdater.addEventListener('submit', (event) => {
  event.preventDefault();

  fetch(`${url}/${currentID}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: inputTitleUpdater.value.trim(),
      description: inputDescriptionUpdater.value.trim()
    })
  })
    .then(response => {
      if (response.ok) {
        console.log("Post updated successfully!");
        postCreatorContainer.style.display = 'none';
        fetchAllToDisplay();
      } else {
        console.error("Failed to update post:", response.statusText);
      }
    })
  postUpdaterContainer.style.display = 'none';
})

formCreater.addEventListener('submit', (event) => {
  event.preventDefault();

  fetch(`${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: inputTitle.value.trim(),
      description: inputDescription.value.trim()
    })
  })
    .then(response => {
      if (response.ok) {
        console.log("Post submitted successfully!");
        postCreatorContainer.style.display = 'none';
        inputTitle.value = "";
        inputDescription.value = "";
        fetchAllToDisplay();
      } else {
        console.error("Failed to submit post:", response.statusText);
      }
    })
})