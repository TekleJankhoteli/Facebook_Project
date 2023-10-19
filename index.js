// Initialize Firebase Authentication

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.2.0/firebase-auth.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.2.0/firebase-firestore.js';
import { updateProfile } from 'https://www.gstatic.com/firebasejs/9.2.0/firebase-auth.js';
const auth = getAuth();

// Variables
       
const loginForm = document.getElementById("login-form");
let loginPassErr=document.getElementById("loginPassErr");
const nameRegex = /^[a-zA-Z]+$/;

        

   
    document.addEventListener('DOMContentLoaded', () => {
        const registrationHeader = document.getElementById("registration-header");
        const registrationForm = document.getElementById("registration-form");
        
        //  Toggle the visibility of the registration form
            registrationHeader.addEventListener('click', () => {
                if (registrationForm.style.display === "none") {
                    registrationForm.style.display = "flex";
                    
                } else {
                    registrationForm.style.display = "none";
                }
            });


            // Add event listener for the registration form 
            registrationForm.addEventListener('submit', (e) => {
                e.preventDefault();
            
                // Get values from registration fields
                const firstName = document.getElementById('displayName').value;
                const lastName = document.getElementById('displayLastName').value;
                const email = document.getElementById('registrationEmail').value;
                const password = document.getElementById('registrationPassword').value;
                const repeatPassword = document.getElementById('repeatPassword').value;
            
                // Get error message elements
                const emailError = document.getElementById('emailError');
                const passError = document.getElementById('passError');
                const repeatedPassErr = document.getElementById('repeatedPassErr');
                const firstNameError = document.getElementById('firstNameError');
                const lastNameError = document.getElementById('lastNameError');
            
                // Reset all error messages
                emailError.textContent = '';
                passError.textContent = '';
                repeatedPassErr.textContent = '';
                firstNameError.textContent = '';
                lastNameError.textContent = '';

            
                // Validations for firstName and lastName
                if (!nameRegex.test(firstName)) {
                    firstNameError.textContent = 'First name can only contain letters.';
                }
            
                if (!nameRegex.test(lastName)) {
                    lastNameError.textContent = 'Last name can only contain letters.';
                }
            
                //  Validation for password 
                if (password !== repeatPassword) {
                    repeatedPassErr.textContent = 'Passwords do not match.';
                } else if (password.length < 6 || password.length > 22) {
                    passError.textContent = 'Password must be between 6 and 22 characters.';
                }
            
                // If no validation errors, proceed with user registration
                if (!firstNameError.textContent && !lastNameError.textContent && !passError.textContent && !repeatedPassErr.textContent) {
                    createUserWithEmailAndPassword(auth, email, password)
                    .then((userCredential) => {
                        const user = userCredential.user;
                
                        // Save first name and last name and email in Firestore
                        const db = getFirestore();
                        const userDocRef = doc(db, 'users', user.uid); 
                        const userData = {
                            firstName: firstName,
                            lastName: lastName,
                            email: email, 
                        };
                        // Set the user's data in Firestore
                        setDoc(userDocRef, userData) 
                            .then(() => {
                                console.log('User registered: ', user);
                                document.getElementById('displayName').value = '';
                                document.getElementById('displayLastName').value = '';
                                document.getElementById('registrationEmail').value = '';
                                document.getElementById('registrationPassword').value = '';
                                document.getElementById('repeatPassword').value = '';

                                alert('User successfully registered');
                            })
                            .catch((error) => {
                                console.log('Error saving user data to Firestore: ', error);
                            });

                          
                    })
                  
                    .catch((error) => {
                        console.log('Registration error: ', error);
                        if (error.code === 'auth/email-already-in-use') {
                            emailError.textContent = 'Email is already in use.';
                        } else {
                            emailError.textContent = 'An error occurred during registration.';
                        }
                    });
                }

            
            });
            

            // Log in 
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
            
                signInWithEmailAndPassword(auth, email, password)
                    .then((userCredential) => {
                        let user=userCredential.user;
                        window.location.href=`profile.html?uid=${user.uid}`
                        console.log('User logged in: ', userCredential.user);
                       
                    })
                    .catch((error) => {
                        console.error('Login error: ', error.code, error.message);
                        if (error.code === 'auth/invalid-login-credentials') {
                            loginPassErr.textContent = 'Password or email is incorrect';
                          
                        } else {
                            loginPassErr.textContent = 'An error occurred during log in.';
                    
                        }


                    });
            });


        });
   