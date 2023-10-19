// Initialize Firebase Authentication
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.2.0/firebase-auth.js';
import { getAuth, signOut } from 'https://www.gstatic.com/firebasejs/9.2.0/firebase-auth.js';
import { getFirestore, collection, doc, setDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc,getDoc } from 'https://www.gstatic.com/firebasejs/9.2.0/firebase-firestore.js';
import { app } from './your-firebase-configuration.js';

const auth = getAuth(app);
const db = getFirestore(app);

function displayUserName(firstName, lastName) {
    const userNameElement = document.getElementById("user-name");
    userNameElement.textContent = `${firstName} ${lastName}`;
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is logged in
        // Now, fetch their data from Firestore using their UID
        const userDocRef = doc(db, 'users', user.uid);

        getDoc(userDocRef)
            .then((docSnap) => {
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    const { firstName, lastName } = userData;
                    displayUserName(firstName, lastName);
                } else {
                    console.error("User data not found in Firestore.");
                }
            })
            .catch((error) => {
                console.error("Error fetching user data: ", error);
            });
    }
});

// Function to change time format
function formatFirestoreTimestamp(timestamp) {
    if (timestamp && timestamp.toDate) {
        const date = timestamp.toDate();
        const options = {
            hour: '2-digit',
            minute: '2-digit',
        };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    } else {
        // Handle the case when timestamp is null or undefined
        return "Timestamp not available";
    }
}
document.addEventListener('DOMContentLoaded', () => {
    // Add event listener for the logout button
    const logoutButton = document.getElementById("logout");
    logoutButton.addEventListener('click', () => {
        // Logout action using Firebase's signOut function
        signOut(auth)
            .then(() => {
                window.location.href = 'index.html';
            })
            .catch((error) => {
                console.error('Logout error: ', error);
            });
    });

    // Save the post in Firestore
    const postForm = document.getElementById("postForm");
    postForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const postContent = document.getElementById("postContent").value;
        const userID = auth.currentUser.uid;

        savePostsToFirestore(userID, postContent);
    });

    function savePostsToFirestore(userID, postContent) {
        const postsCollection = collection(db, "posts");
        const newPostRef = doc(postsCollection);

        setDoc(newPostRef, {
            userID: userID,
            content: postContent,
            timestamp: serverTimestamp()
        })
            .then(() => {
                console.log("Post saved to Firestore");
                document.getElementById("postContent").value = "";
            })
            .catch((error) => {
                console.error("Error saving post: ", error);
            });
    }

    const postsContainer = document.getElementById("postsContainer");

    // Function to create posts
    async function renderPosts(posts) {
        postsContainer.innerHTML = ""; // Clear the existing content

        for (const post of posts) {
            // Fetch user data based on the post's userID
            const userDocRef = doc(db, 'users', post.userID);

            try {
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    const { firstName, lastName } = userData;
                    const postElement = document.createElement("div");
                    postElement.classList.add("post");
                    const uniquePostId = post.id; // Unique identifier for the post
                    postElement.setAttribute("data-post-id", uniquePostId);
                    postElement.innerHTML = `
                        <p class="nameLastname"> ${firstName} ${lastName}</p>
                        <p> ${post.content}</p>
                        <div class="timeAndDelete">
                        <p class="timestamp"> ${formatFirestoreTimestamp(post.timestamp)}</p>
                        <button class="delete-post" data-post-id="${uniquePostId}">Delete</button>
                        </div>
                    `;

                    postsContainer.appendChild(postElement);
                }
            } catch (error) {
                console.error("Error fetching user data: ", error);
            }
        }
    }

    // Add event listener to the "Delete" buttons
    postsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains("delete-post")) {
            const postId = event.target.getAttribute("data-post-id");
            deletePost(postId);
        }
    });

    // Function to delete a post
    function deletePost(postId) {
        // Delete the post from Firestore based on its ID
        const postRef = doc(db, "posts", postId);

        deleteDoc(postRef)
            .then(() => {
                console.log("Post deleted from Firestore");
            })
            .catch((error) => {
                console.error("Error deleting post: ", error);
            });
    }

    // Function to fetch and display posts
    function fetchAndDisplayPosts() {
        const postsCollection = collection(db, "posts");

        // Order of posts
        const q = query(postsCollection, orderBy("timestamp", "desc"));

        // When changes happen the code is automatically updated
        onSnapshot(q, (snapshot) => {
            const posts = [];
            snapshot.forEach((doc) => {
                posts.push({ id: doc.id, ...doc.data() });
            });
            renderPosts(posts);
        });
    }

    fetchAndDisplayPosts();
});