var slider = document.getElementById("speedSlider");
var output = document.getElementById("curSpeed");
var presets = document.getElementsByClassName("presets");

output.innerHTML = 1 + ".00x";

window.onload = async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
            let vid = document.querySelector("video");
            if(vid == null){
                return -1;
            }
            if(!vid.hasAttribute("rateChangeListenerApplied")){
                vid.addEventListener("ratechange", (event) => {
                    chrome.runtime.sendMessage({newPlaybackSpeed:vid.playbackRate});
                });
            }
            vid.setAttribute("rateChangeListenerApplied",'true');
            return vid.playbackRate;
        },

    }, (res) => {
        speed = parseFloat(res[0].result);

        if(speed != -1){
            slider.value = inverse(speed);
            output.innerHTML = speed.toFixed(2) + "x";
        }
    });

}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        speed = parseFloat(request.newPlaybackSpeed);
        if(speed != -1){
            slider.value = inverse(speed);
            output.innerHTML = speed.toFixed(2) + "x";
        }
    }
  );

slider.addEventListener("change", async() =>  {
    val = convert(slider.value);
    output.innerHTML = val.toFixed(2) + "x";
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: changeSpeed,
        args: [val],
    });
});

for(let button of presets){
    button.addEventListener("click", async() =>  {
        val = parseFloat(button.value);
        slider.value = inverse(val);
        
        output.innerHTML = val.toFixed(2) + "x";

        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: changeSpeed,
            args: [val],
        });
    },false);
}

function changeSpeed(speed){
    if(document.querySelector("video")== null){
        return;
    }
    document.querySelector("video").playbackRate=speed;
}

function convert(n){
    if (n >= 0){
        return (n/1000) * 4 + 1;
    } else {
        return (n/1000) + 1;
    }
    
}
function inverse(n){
    if (n < 1) {
        return (n - 1) * 1000;
    } else {
        return (n - 1)/4 * 1000;
    }
}
