// Declare Store object using Immutable.Map
let store = Immutable.Map({
    user: Immutable.Map({ name: "Dina" }),
    apod: '',
    currentRover: '', // represent the current selcted rover
    rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']), // List of the rovers Name
    roversData: Immutable.Map() // Rovers Data: Information + most recent taken images
})

// add our markup to the page
const root = document.getElementById('root')

// Update the store using Immutable.js mergeDeep
const updateStore = (store, newState) => {
    const updatedStore = store.mergeDeep(newState);
    render(root, updatedStore);
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}


// create content
const App = (state) => {
    return welcome(state)
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS
const welcome = (state) => {
    return `
        <section class="welcome">
            ${Greeting(state.get('user').get('name'))}
            <div>
                <p>
                    One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                    the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                    This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                    applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                    explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                    but generally help with discoverability of relevant imagery.
                </p>
                ${ImageOfTheDay(state)}
            </div>
        </section>
    `
}

// Pure function for greeting 
const Greeting = (name) => {
    return name ? `<h1>JS Functional Programming With NASA API</h1> 
                   <h2> Welcome, ${name}!</h2>`
                : `<h1>Hello!</h1>`
}

// Example of a pure function that renders infomation requested from the backend to get the image of the date
const ImageOfTheDay = (state) => {
    let apod = state.get('apod')
    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    if (!apod || apod.date === today.getDate() ) {
        getImageOfTheDay(state)
        apod = state.get('apod')
    }

    // check if the photo of the day is actually type video!
    if (apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        return (`
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `)
    }
}

// ------------------------------------------------------  API CALLS

// API Call to get the image of the day
const getImageOfTheDay = (state) => {
    fetch(`http://localhost:3000/apod`)
      .then(res => res.json())
      .then(apod => updateStore(state, { apod }))
      .catch(err => console.error('getImageOfTheDay: Oops, Something went wrong!', err));
};

// API Call to get rover Data (info + most recent taken images)
const getRoverData= (state, roverName) => {
    fetch(`http://localhost:3000/rovers/${roverName}`)
        .then(res => res.json())
        .then(photos => {
            updateStore(state, {
                currentRover: roverName,
                roversData: {
                    [roverName]: {
                        photos: photos,
                        roverDetails: photos[0].rover,
                    },
                },
            });
        })
        .catch(err => console.error('getRoverData: Oops, Something went wrong!', err));
}
