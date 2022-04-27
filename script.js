// life is easy //
function $_(selector, context) {
    return (context || document).querySelectorAll(selector);
}
function $(selector, context) {
    return (context || document).querySelector(selector);
}

// life is easy //
function calculatePrevious(){
    switch(pendingOperation[1]){
        case "plus": displayDigit = Calculate.add(+currentInput);  break;
        case "minus": displayDigit = Calculate.subtract(+currentInput);  break;
        case "multiply": displayDigit = Calculate.multiply(+currentInput);  break;
        case "divide": displayDigit = Calculate.divide(+currentInput);  break;
    }
    pendingOperation[0] = false;
}


function findPercentage(){
    if(Logs.length){
        switch(Logs[Logs.length - 1].operations){
            case "multiply":    displayDigit = +pendingOperation[2] * +displayDigit / 100; break
            case "divide":      displayDigit = +pendingOperation[2] * 100 / +displayDigit; break
            case "plus":        displayDigit = +pendingOperation[2] + +pendingOperation[2] * +displayDigit / 100; break
            case "minus":       displayDigit = +pendingOperation[2] - +pendingOperation[2] * +displayDigit / 100; break
            case "mark-up":     displayDigit = +pendingOperation[2] * 100 / (100 - +displayDigit); break
        }
    }
    pendingOperation[0] = false;
}


function calculate(operation){
    currentInput = (resetPrimaryDisplay) ? pendingOperation[2] : displayDigit;
    if(operation == "equal" && pendingOperation[0] == false){calculatePrevious();};
    if(operation == "percentage" && pendingOperation[0] == true){findPercentage();};
    if(operation == "clear" ) {displayDigit  = primaryDisplay.value = "0"; playSound("Backspace"); return;};
    if(operation == "equal" && pendingOperation[0] == true){pendingOperation[2] = displayDigit;};
    if(operation == "reset" ) {displayDigit  = primaryDisplay.value = "0"; Logs.length=0; playSound("reset"); return;};
    if(operation == "delete"){
        if(resetPrimaryDisplay) return;
        displayDigit = displayDigit.toString().slice(0, -1); 
        primaryDisplay.value = (/\.\d/.test(displayDigit)) ? +displayDigit : (+displayDigit || 0) + ".";
        secondaryDisplay.value =  "";
     // resetPrimaryDisplay = false;
        playSound("Backspace");
        return;
    }
    if(pendingOperation[0]){calculatePrevious()};

        switch(operation){
            case "plus": case "minus": case "multiply": case "divide": case "mark-up":
                pendingOperation[0] = true;
                break;
            case "square": displayDigit = Calculate.pow(displayDigit, 2); break;
            case "square-root": displayDigit = Calculate.root(displayDigit, 2); break;
            case "factorial": displayDigit = Calculate.factorial(displayDigit); break;
            case "plus-minus": displayDigit = Calculate.plusMinus(displayDigit); break;
            case "memory-plus": memory += +displayDigit; break;
            case "memory-minus": memory -= +displayDigit; break;
            case "memory": 
                memory =  (Logs[Logs.length-1].operations != "memory" ) ? memory : 0; 
                displayDigit =  memory; 
                break;
        };
        playSound("function");

    if(pendingOperation[0]){
        pendingOperation[1] = operation 
        pendingOperation[2] = displayDigit
    };
    
    saveLog(currentInput,operation,displayDigit,Calculate.previousResult())
    if(["-0","-","0",0].includes(displayDigit)){displayDigit = ""}
    result= Logs[Logs.length - 1].result || 0;
    result = (/\.\d/.test(result)) ? +result.toFixed(10) : (+result || 0) + "."  ;
    primaryDisplay.value= maxError(result);
    resetPrimaryDisplay = true;
}

function maxError(value){
if(value > 999999999999) return "maxError"
value = value.toString()
console.log(Logs[Logs.length-1].result)
    if(value.length <= 13){
        return value;
    }else{
        // if(/\./.test(value)){
        splitValue = value.split(".");
        return splitValue[0].length <= 13 ? value.slice(0, 12) : "maxError";
        // }else{return "maxError";}
    }
}

function liveOutput(value){

    if((primaryDisplay.value.length <= 12) || (resetPrimaryDisplay && pendingOperation[0])){

        displayDigit = resetPrimaryDisplay ? value : displayDigit + value; 
        primaryDisplay.value = (/\.\d/.test(displayDigit)) ? +displayDigit : (+displayDigit || 0) + ".";
        secondaryDisplay.value =  "";

    }else{
        secondaryDisplay.value =  "maxReached";
    }
    resetPrimaryDisplay = false;
    playSound("Number"); 
}

function userInput(e){

    switch(e.target.getAttribute("data-type")){
        case "point": if(/\./.test(displayDigit) && resetPrimaryDisplay == false){return;};
        case "number": 
        // if(["-0","-","0",0].includes(displayDigit)){displayDigit = ""}
            liveOutput(e.target.value);

        break;
        case "operation": 
            secondaryDisplay.value =  e.target.value;
            calculate(e.target.getAttribute("data-key")); 
            break;
    }

    dltBtnVisibility();
}


function keySupport(e){
    e.preventDefault()

    switch(e.code){
        case "NumpadDecimal": if(/\./.test(displayDigit)){return;};
        case "Numpad0": case "Numpad1":  case "Numpad2":  case "Numpad3": 
        case "Numpad4":  case "Numpad5":  case "Numpad6":  case "Numpad7": 
        case "Numpad8":  case "Numpad9": 
            liveOutput(e.key);
            break;

        case "Backspace":
            calculate("delete");
            playSound(e.code);
            // secondaryDisplay.value =  "⌦";
            break;

        case "NumpadAdd":
            
            calculate("plus");
            playSound("function");
            secondaryDisplay.value = e.key;
            break;

        case "NumpadSubtract":
            calculate("minus");
            playSound("function");
            secondaryDisplay.value =  e.key;
            break;

        case "NumpadMultiply":
            calculate("multiply");
            playSound("function"); 
            secondaryDisplay.value =  e.key;
            break;

        case "NumpadDivide":
            calculate("divide");
            playSound("function");
            secondaryDisplay.value =  e.key;
            break;

        case "NumpadEnter":
            calculate("equal");
            playSound("function");
            secondaryDisplay.value =  "=";
            break;

        case "Delete":
            calculate("reset");
            playSound("reset");
            secondaryDisplay.value =  "AC";
            break;

        case "Escape":
            calculate("clear");
            playSound("Backspace");
            secondaryDisplay.value =  "C";
            break;
    }

    dltBtnVisibility();
}
function dltBtnVisibility(){
    if(resetPrimaryDisplay || primaryDisplay.value == 0){
        deleteBtn.style.opacity = 0.1;
        deleteBtn.classList.add("disabled");
    }else{
        deleteBtn.style.opacity = 0.7;
        deleteBtn.classList.remove("disabled");
    }
}

function saveLog(currentInput,operations,result,previousResult){
    Logs.push({
        previousResult: +previousResult,
        currentInput: +currentInput,
        operations: operations,
        result: +result
    });
}

function playSound(e) {
    const audio = document.querySelector(`audio[data-audio=${e}]`);
    if (!audio) return;
    if(!audioBtn.checked) return;
    audio.currentTime = 0;
    audio.play();
  }

  //basic math functions
const Calculate = {
    add:        function(a){return this.previousResult() + a },
    subtract:   function(a){return this.previousResult() - a },
    multiply:   function(a){return this.previousResult() * a },
    divide:     function(a){return this.previousResult() / a },
    pow:        (a, b)  => {return a ** b},
    plusMinus:  (a)     => {return a * -1 },
    root:       (a, b)  => {return a ** (1/b)},
    markUp:     (a, b)  => {return a / (100-b) * 100},
    factorial:  (a)     => {return a > 1 ? a * Calculate.factorial(a-1) : 1},
    previousResult(){return Logs.length ? Logs[Logs.length - 1].result : 0},
}
const Logs = [
    // {
    //     previousResult: 15,
    //     currentInput: 5,
    //     operations: "add",
    //     result: 20
    // }
]

let memory = 0;
let displayDigit = "";
let currentInput = "";
let resetPrimaryDisplay = false;
const pendingOperation = [false, "", 0];
const deleteBtn = $("#delete");
const primaryDisplay = $(`#display`)
const secondaryDisplay = $(`#indicator`)
const virtualKeysArray = [...$_('input[type=button]')];
const audioBtn = $('.display input[type="checkbox"]');

virtualKeysArray.forEach(e => e.addEventListener('click', userInput));
document.addEventListener('keydown', keySupport);
