'use strict';



const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout{
    date;
    id;
    coords;
    distance;
    duration;
    constructor(coords,distance,duration){
        this.date=new Date();
        this.id=Date.now()+''.slice(-10)
        this.coords=coords;
        this.distance=distance;
        this.duration=duration;
    }
    _setDiscription()
    {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; 
     this.Discription = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`
    }
}
class Running extends  Workout{
    type='running'
    cadence;
    constructor(coords,distance,duration,cadence){
        super(coords,distance,duration)
        this.cadence=cadence
        this.calPace()
        this._setDiscription();
    }
    calPace(){
        this.pace=this.duration/this.distance;
        return this.pace;
    }
}
class Cycling extends  Workout{
    elevationGain;
    type='cycling';
    constructor(coords,distance,duration,elevationGain){
        super(coords,distance,duration)
        this.elevationGain=elevationGain;
        this.calSpeed()
        this._setDiscription();
    }
    calSpeed(){
        this.speed=this.distance/(this.duration/60);
        return this.speed
    }
}

const run=new Running([29,-12],12,50,39)
const cycle=new Cycling([29,-12],12,50,39)
class  App{
     #map;
     #mapClick;
     #workouts;
    constructor(){
        this.#workouts=[];
        this._getPosition()
        form.addEventListener('submit',this._newWorkout.bind(this))
        inputType.addEventListener('change',this._togleElevationField)
        containerWorkouts.addEventListener('click',this.movePupup.bind(this))
        this._getLocalStorage()
    }
    _getPosition(){
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),function(){
                alert("Can't able To fetch your locaion");
            })
        }
    }
    _loadMap(position){
        const {latitude} = position.coords;
        const {longitude}=position.coords;
        // console.log(latitude,longitude);
        const coords=[latitude,longitude];
        this.#map = L.map('map').setView(coords, 13);

        L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);
        this.#map.on('click',this._showForm.bind(this))
        this.#workouts.forEach(element => {
            this._renderPopup(element)
        })

    }
    _showForm(mapCl){
        this.#mapClick=mapCl;
        form.classList.remove('hidden')
        inputDistance.focus();
    }
    _hideForm()
    {
        form.classList.add('hidden')
    }
    _togleElevationField(){
            inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
            inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }
    _newWorkout(e){
            e.preventDefault();
            const validInput1=(...input)=>{return input.every(inp=>Number.isFinite(inp))}
            const validInput2=(...input)=>{return input.every(inp=> inp > 0)}
            const {lat,lng}=this.#mapClick.latlng;
            const type=inputType.value;
            const distance= +inputDistance.value;
            const duration= +inputDuration.value;
            let workout
            // checking all input fieds
            if (type==='running'){
                const cadence= +inputCadence.value;
                if (!validInput1(distance,duration,cadence) || !validInput2(distance,duration,cadence))
                {return alert('Inputs have to be positive numbers!');}
                workout = new Running([lat,lng],distance,duration,cadence)
            }
            if(type==='cycling'){
                const elevation= +inputElevation.value;
                if (
                    !validInput1(distance, duration, elevation) ||
                    !validInput2(distance, duration)
                  )
                    {return alert('Inputs have to be positive numbers!');}
                    workout = new Cycling([lat,lng],distance,duration,elevation)
            }
            this.#workouts.push(workout);
            this._renderPopup(workout);
            this._renderWorkoutList(workout)
            this._hideForm();
            this._setLocalStorage();
    }
    _renderPopup(workout){
        inputDistance.value=inputDuration.value=inputCadence.value=inputElevation.value='';
            L.marker(workout.coords).addTo(this.#map)
                .bindPopup(L.popup({
                    maxWidth: 300,
                    minWidth: 20,
                    autoClose: false,
                    closeOnClick: false,
                    className: `${workout.type}-popup`,
                }))
                .setPopupContent(`${workout.type==='running'? '🏃‍♂️': '🚴‍♀️'} ${workout.Discription}`)
                .openPopup();
    }
    _renderWorkoutList(workout){
        let html=`<li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.Discription}</h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.type==='running'? '🏃‍♂️': '🚴‍♀️'}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>`
          if (workout.type==='running') {
            html+=`<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`
          }
          if(workout.type==='cycling'){
            html+=`
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(2)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
            `
          }
          form.insertAdjacentHTML('afterend',html)
    }
    movePupup(e){
        const workoutEl=e.target.closest('.workout')
        if(!workoutEl) return
        const workout=this.#workouts.find(work=> workoutEl.dataset.id==work.id)
        this.#map.setView(workout.coords,13,{
            animate: true,
            pan:{
                duration:1,
            },
        })
    }
    _setLocalStorage(){
        localStorage.setItem('workouts',JSON.stringify(this.#workouts));
    }
    _getLocalStorage(){
        const data=JSON.parse(localStorage.getItem('workouts'))
        // console.log(data);
        if(!data) return;
        this.#workouts=data
        this.#workouts.forEach(element => {
            this._renderWorkoutList(element)
        });
    }
    reset(){
        localStorage.removeItem('workouts');
        location.reload();
    }
};

const app = new  App();