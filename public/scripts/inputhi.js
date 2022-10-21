let array = [];
let markers = {};
let counter = 0;
const ACCESS_TOKEN = 'pk.eyJ1Ijoic2FuZGVlcDUwIiwiYSI6ImNsMzJrZmw2MzBreDYzanA5dWZtOHl2enMifQ.6yMJx9aDi0XJLQCkVEKdkw';

window.addEventListener("load", () => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoic2FuZGVlcDUwIiwiYSI6ImNsMzJrZmw2MzBreDYzanA5dWZtOHl2enMifQ.6yMJx9aDi0XJLQCkVEKdkw';
        
    let map = new mapboxgl.Map({
            container: 'map1',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [77.1025, 28.7041],
            zoom: 3
        });    

    map.on('style.load', () => {
        map.on('click', (e) => {                
            var coordinates = e.lngLat;
            add_form(coordinates.lat, coordinates.lng, counter);
            //popup        
            const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
                            '<button type="button" class="bg-success remove" style="width: 50px;" onclick="open_form('+ counter +')">Open</button>'
                        );

            const temp = new mapboxgl.Marker()
                            .setLngLat(coordinates)
                            .setPopup(popup)
                            .addTo(map);
            markers[counter] = temp;
            for (var marker in markers) {
                markers[marker].getElement().addEventListener('mouseenter', () => markers[marker].togglePopup());
                // markers[marker].getElement().addEventListener('mouseleave', () => markers[marker].togglePopup());
            }
            counter++;
        });      
        function onMouseMove(e) {
            const canvas = map.getCanvas();
            const node = document.querySelector('#map-popup');            
            if (e) {
                canvas.style.cursor = 'pointer';
                //Reverse Geocoding
                async function fetchAddressJSON() {
                    const response = await fetch('https://api.mapbox.com/geocoding/v5/mapbox.places/'
                        + e.lngLat.lng + ', ' + e.lngLat.lat
                        + '.json?access_token=' + ACCESS_TOKEN);
                    const address = await response.json();
                    return address;
                }              

                fetchAddressJSON().then(address => 
                    node.textContent = address.features[0].place_name
                );
                
                node.style.left = `${e.originalEvent.clientX}px`;
                node.style.top = `${e.originalEvent.clientY}px`;
                node.style.display = 'block';
                console.log('in');
            }
            else {
                node.textContent = '';
                node.style.display = 'none'
            }
        }
        map.on('mousemove', onMouseMove);
    });
    
});

function propagate(counter) {
    $('div.dropdown').off().on('click', function (event) {
        event.stopPropagation();
    });
}

//Add form in top
function add_form(latitude, longitude, counter) {
    array[counter] = [];
    const ACCESS_TOKEN = 'pk.eyJ1Ijoic2FuZGVlcDUwIiwiYSI6ImNsMzJrZmw2MzBreDYzanA5dWZtOHl2enMifQ.6yMJx9aDi0XJLQCkVEKdkw';

    let parent = document.getElementById('parent');
    let dialog = document.createElement('dialog');
    html =  '<button class="btn btn-secondary dropdown-toggle" onclick="propagate('+ counter +')" id="dropdown-'+ counter +'" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" \
                aria-expanded="false">\
                Loading...\
            </button>\
            <ul class="dropdown-menu" id="dropdownul-'+ counter +'" aria-labelledby="dropdownMenuButton1">\
                <li>\
                    <div class="row mt-3">\
                        <div class="col">\
                            <label>Latitude</label>\
                            <input type="number" class="form-control" id="lat'+ counter +'" name="latitude'+ counter +'" value='+ latitude +'>\
                        </div>\
                    </div>\
                </li>\
                <li>\
                    <div class="row mt-3">\
                        <div class="col">\
                            <label>Longitude</label>\
                            <input type="number" class="form-control" id="lng'+ counter +'" name="longitude'+ counter +'" value='+ longitude +'>\
                        </div>\
                    </div>\
                </li>\
                <li>\
                    <div class="row mt-3">\
                        <div class="col">\
                            <label>Sampling Date</label>\
                            <input type="date" name="date'+ counter +'" class="form-control">\
                        </div>\
                    </div>\
                </li>\
                <li>\
                    <div class="d-flex justify-content-between mt-3" id=parameter-'+ counter +'>\
                        <select class="form-select form-select-sm w-100" onchange="add_param('+ counter +')" id="select-'+ counter +'" aria-label=".form-select-sm example">\
                            <option selected disabled value="Select Parameter...">Select Parameter...</option>\
                            <option value="ammonium">Ammonium</option>\
                            <option value="nitrate">Nitrate</option>\
                            <option value="nitrite">Nitrite</option>\
                            <option value="phosphate">Phosphate</option>\
                            <option value="fluoride">fluoride</option>\
                        </select>\
                    </div>\
                </li>\
                <li>\
                    <button type="button" class="bg-danger close" id="close-'+ counter +'" onclick="close_form('+ counter +')">\
                        Save\
                    </button>\
                </li>\
            </ul>\
            <button type="button" class="bg-danger remove" id="remove-'+ counter +'" onclick="remove_form('+ counter +')">\
                Del\
            </button>';
    dialog.innerHTML = html;

    //Adding Submit button in the bottom
    if (document.querySelectorAll('dialog').length === 0) {
        // dialog.appendChild(dropdown);
        parent.appendChild(dialog);

        let input = document.createElement("input");
        input.setAttribute('id', 'submit');
        input.type = 'submit';
        input.value = 'Submit';
        parent.appendChild(input);
    }
    else {
        let submit = document.getElementById('submit');
        // dialog.appendChild(dropdown);
        parent.insertBefore(dialog, submit);
    }
    
    const lat = document.getElementById(`lat${counter}`).value;
    const lng = document.getElementById(`lng${counter}`).value;
    const add = document.getElementById(`dropdown-${counter}`);

    //Reverse Geocoding
    async function fetchAddressJSON() {
        const response = await fetch('https://api.mapbox.com/geocoding/v5/mapbox.places/'
            + lng + ', ' + lat
            + '.json?access_token=' + ACCESS_TOKEN);
        const address = await response.json();
        return address;
    }

    fetchAddressJSON().then(address => 
        add.innerHTML = address.features[0].place_name
    );
    dialog.show();
}

function open_form(count) {
    console.log('open');
    document.getElementById(`close-${count}`).parentElement.parentElement.parentElement.showModal();
} 

function close_form(count) {
    document.getElementById(`close-${count}`).parentElement.parentElement.parentElement.close();
}

 //Remove form
function remove_form(count) {
    document.getElementById(`remove-${count}`)?.parentElement?.remove();
    markers[count].remove();
    delete markers[count];
    if (document.querySelectorAll('dialog').length === 0) {
        document.getElementById('submit').remove();
        counter = 0;
    }
}

//Add parameter at top using Add Parameter Button
function add_param(count) {
    var unit;
    var value;
    var attrib;
    var select = document.getElementById(`select-${count}`).value;
    if (select != 'Select Parameter...' && array[count].indexOf(select) == -1) {
        var parent = document.getElementById(`dropdownul-${count}`);
        var li = document.createElement("li");
        var div = document.createElement("DIV");
        div.setAttribute('class', "row mt-3");
        //values
        
        if (select == "ammonium") {
            value = 0.085;
            div.setAttribute('id', `ammonium${count}`);
            attrib = 'nh4';
            unit = ' (in mg/l)';
        }
        else if (select == "nitrate") {
            value = 0.34;
            div.setAttribute('id', `nitrate${count}`);
            attrib = 'no3';
            unit = ' (in mg/l)';
        }
        else if (select == "nitrite") {
            value = 0.007;
            div.setAttribute('id', `nitrite${count}`);
            attrib = 'no2';
            unit = ' (in mg/l)';
        }
        else if (select == "phosphate") {
            value = 0.062;
            div.setAttribute('id', `phosphate${count}`);
            attrib = 'po4';
            unit = ' (in mg/l)';
        }
        else if (select == "fluoride") {
            value = 0.1;
            div.setAttribute('id', `fluoride${count}`);
            attrib = 'f';
            unit = ' (in mg/l)';
        }

        if (select === 'ph') {
            html =  '<div class="d-flex flex-column">\
                        <label>'+ select.charAt(0).toLowerCase() + select.charAt(1).toUpperCase() + `${unit}` +'</label>\
                        <div class="d-flex">\
                            <input type="number" class="form-control" name="'+ select.split(' ').join('_') +''+ count +'" value='+ value +'>\
                            <button type="button" class="btn btn-danger" onclick="remove_parameter('+ select + count +', '+ count +')">\
                                <i class="fas fa-times"></i>\
                            </button>\
                        </div>\
                    </div>';
        }
        else {
            var str = select.replace(/_/g, ' ');
            html =  '<div class="d-flex flex-column">\
                        <label>'+ str.charAt(0).toUpperCase() + str.slice(1) + `${unit}` +'</label>\
                        <div class="d-flex">\
                            <input type="number" class="form-control" name="'+ select.split(' ').join('_') +''+ count +'" value='+ value +'>\
                            <button type="button" class="btn btn-danger" onclick="remove_parameter('+ select + count +', '+ count +')">\
                                <i class="fas fa-times"></i>\
                            </button>\
                        </div>\
                    </div>';
        }
        // console.log(count);
        div.innerHTML = html;
        li.appendChild(div);
        if (array[count].length === 0) {
            // parent.appendChild(li);
            const button = document.getElementById(`close-${count}`);
            parent.insertBefore(li, button.parentElement);
        }
        else {
            const node = document.getElementById(`parameter-${count}`);
            parent.insertBefore(li, node.parentElement.nextSibling);
            // console.log(node);
        }
        array[count].push(select);
    }
    console.log(array[count]);
    document.getElementById(`select-${count}`).value = 'Select Parameter...';
}

//Remove parameter
function remove_parameter(param, count) {
    array[count].pop();
    // const result = array[count].filter(deleteSelect);
    // function deleteSelect(temp) {
    //     return temp != param.name;
    // }
    // array[count] = result;
    param.parentElement.parentElement.parentElement.parentElement.remove();
    console.log(array[count]);
}