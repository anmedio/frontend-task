/* ---------------------------------------------------------------- */
var mobileWith = 420;
Inputmask({"mask": "+7 (999) 999-99-99"}).mask("[name='customer_phone']");
var minInputLenth = 3;  // the minimum length for entering a name and address
var maxBottleCount = 999;
var timeArr = {
	weekdays: ['10:00 - 11:00', '12:00 - 13:00', '15:00 - 16:00'],
	weekend: ['12:00 - 13:00', '15:00 - 16:00']
};
/* ---------------------------------------------------------------- */

// Content
var promo_block         =   ['.left_block'];
var order_contact_info  =   ['.right_block', '.order_title', '.order_title h2', '.order_contact_info', '.open_order_detail'];
var order_detail        =   ['.right_block', '.order_title', '.prev_page', '.order_detail', '.total_price', '.order_submit'];
var order_resume        =   ['.right_block', '.order_title', '.order_title h2', '.order_success', '.order_resume', '.total_price', '.order_info', '.new_order'];
var all_elms = [];
all_elms                =   all_elms.concat(all_elms, order_contact_info, order_detail, order_resume, promo_block);
all_elms                =   [...new Set(all_elms)];  //get array with uniqe elmements (without duplicates)


// Week days
var weekday = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
var month = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

// Order object
var orderData = {};

// ready
(function() {

    open_order_form.onclick = function() {
        setInner('.order_title h2', 'Заполните данные');
        elemHide(all_elms);
        showBlock(order_contact_info);
    };

    open_order_detail.onclick = function() {
        if(validForm()){
            elemHide(all_elms);
            showBlock(order_detail);
        }
    };

    prev_page.onclick = function() {
        elemHide(all_elms);
        showBlock(order_contact_info);
    }

    // Sendmail
    order_submit.onclick = function() {
    	getOrderData();
    	var jsonData = orderData;
    	var xhr = new XMLHttpRequest();

    	xhr.onreadystatechange = function() {
			if(xhr.readyState === 4 && validForm()) {
				if(xhr.status === 200) { 
					setInner('.order_title h2', 'Заказ оформлен');
			        size = getBrowsSize();
			        if(size.width > mobileWith) {
			            elemHide(order_contact_info);
			            elemHide(order_detail);
			        } else {
			            elemHide(all_elms);
			        }

			        showBlock(order_resume);

			        elmByQuery('.resume_bottle_variant').innerText = 'Бутыль ' + orderData.bottleVariant;
			        elmByQuery('.resume_bottle_count').innerText = orderData.bottleCount + ' шт';
			        elmByQuery('.resume_date').innerText = orderData.dateDelivery.getDate() + ' ' + month[orderData.dateDelivery.getMonth()];
			        elmByQuery('.resume_time').innerText = orderData.timeDelivery;
			        elmByQuery('.resume_address_value').innerText = orderData.address;
			        elmByQuery('.resume_phone_value').innerText = orderData.phone;
			        elmByQuery('.order_num').innerText = "№" + randomInteger(100, 999);

				} else {
					alert('Во время оформления заказа произошла ошибка. попробуйте повторить заказ чуть позже');
					console.log('An error occurred during your request: ' +  xhr.status + ' ' + xhr.statusText);
				} 
			}
		}

		var formattedJsonData = JSON.stringify( jsonData  );
		xhr.open('POST', '/sendmail.php', true);
		xhr.setRequestHeader('Content-type', 'application/json');
		xhr.send(formattedJsonData);
    };

    new_order.onclick = function() {
    	document.location.reload(true);
    }

    elmByName("customer_name")[0].oninput = function(e){validForm(e)};
    elmByName("customer_mail")[0].oninput = function(e){validForm(e)};
    elmByName("customer_phone")[0].oninput = function(e){validForm(e)};
    elmByName("customer_address")[0].oninput = function(e){validForm(e)};
    elmByName("customer_privacy")[0].oninput = function(e){validForm(e)};


    // Change volume variant
	document.addEventListener('click', function(e) {
		if (!e.target.matches('.bottle_params, .bottle_params *')) return;
		e.preventDefault();

		var curVolumeVariant = e.target.closest('.volume_variant');
		var allVolumeVariants = elmByClass('volume_variant');

		[].forEach.call(allVolumeVariants, function(element) {
			if(element.classList.contains('volume_variant_active')) {
				element.classList.remove("volume_variant_active");
				element.querySelector('.bottle_count').style.display = 'none';
			}
		});

		curVolumeVariant.classList.toggle("volume_variant_active");
		curVolumeVariant.querySelector('.bottle_count').style.display = 'flex';

		calcPrice();
		getOrderData();

	}, false);


	// Change count of bottle (plus / minus)
	var changeCountValue =  function(e, name, sign) {
		if(!e.target.matches('.bottle_count_btn'+name)) return;
		e.preventDefault();

		var thisCountWrap = e.target.closest('.bottle_count');
		var countField = thisCountWrap.querySelector('[name="count_field"]');
		var curValue = parseInt(countField.value);
		
		if(sign > 0 && curValue < maxBottleCount) countField.value = curValue + sign;
		if(sign < 0 && curValue > 1) countField.value = curValue + sign;

		calcPrice();
		getOrderData();
	}

	document.addEventListener('click', function(e) {changeCountValue(e, '.plus', 1);}, false);
	document.addEventListener('click', function(e) {changeCountValue(e, '.minus', -1);}, false);


	// Change date
	document.addEventListener('click', function(e) {
		if (!e.target.matches('.tiny-slide, .tiny-slide *')) return;
		e.preventDefault();

		var curVolumeVariant = e.target.closest('.tiny-slide');
		var allVolumeVariants = elmByClass('tiny-slide');

		[].forEach.call(allVolumeVariants, function(element) {
			if(element.classList.contains('active_slide')) {
				element.classList.remove("active_slide");
			}
		});

		curVolumeVariant.classList.toggle("active_slide");
		setDelivInterval(timeArr);
		getOrderData();

	}, false);

	
	// Change time
	document.addEventListener('click', function(e) {
		if (!e.target.matches('.delivery_time_item, .delivery_time_item *')) return;
		e.preventDefault();

		var curVolumeVariant = e.target;
		var allVolumeVariants = elmByClass('delivery_time_item');

		[].forEach.call(allVolumeVariants, function(element) {
			if(element.classList.contains('active_time')) {
				element.classList.remove("active_time");
			}
		});

		curVolumeVariant.classList.toggle("active_time");
		getOrderData();

	}, false);


	// Calculate total price
	function calcPrice() {
		var activeBottleVariant = elmByQuery('.volume_variant.volume_variant_active');
		var priceValue = parseInt(activeBottleVariant.querySelector('.price').innerText);
		var count = parseInt(activeBottleVariant.querySelector('.bottle_count [name="count_field"]').value);
		var totalPrice = count * priceValue;
		elmByQuery('.total_price_value .int_value').innerText = totalPrice;
	}


	// Date initial values
	Date.prototype.addDays = function(days) {
	    var date = new Date(this.valueOf());
	    date.setDate(date.getDate() + days);
	    return date;
	}

	n =  new Date();
    var sliderItems = elmByQueryAll('.tiny-slide');
    for (var i = 0; i < sliderItems.length; i++) {
    	if(i != 0) n = n.addDays(1);

    	input = document.createElement("INPUT");
		input.setAttribute("type", "hidden");
		input.setAttribute("class", "delivery_date");
		input.setAttribute("value", n);
		sliderItems[i].append(input);

    	day = n.getDate();
    	wday = n.getDay();
        sliderItems[i].querySelector('.day_value').innerHTML = day;
        sliderItems[i].querySelector('.week_value').innerHTML = weekday[wday];
        if(wday == 0 || wday == 6) {
        	sliderItems[i].querySelector('.week_value').style.color = '#FD7562';
        } else {
        	sliderItems[i].querySelector('.week_value').style.color = '#9CAEDD';
        }
    };

    // Date slider
	var slider = tns({
		container: '.slider-wrapper',
		items: 7,
		speed: 1000,
		loop: true,
		controlsContainer: "#customize-controls",
		autoplayButtonOutput: false,
		nav: false,
		slideBy: 'page',
		mouseDrag: true,
    	lazyload: true,
		responsive: {
			420: {
				items: 6
			}
		}
	});

	setDelivInterval(timeArr);
	calcPrice();
	getOrderData();

})();

function validForm(e) {
    var boolName, boolMail, boolPhone, boolAddres, boolPrivacy;
    var customer_name = elmByName("customer_name")[0];
    var customer_mail = elmByName("customer_mail")[0];
    var customer_phone = elmByName("customer_phone")[0];
    var customer_address = elmByName("customer_address")[0];
    var customer_privacy = elmByName("customer_privacy")[0];
    
    // check name
    if(customer_name.value != 'undefined' && customer_name.value != '' && customer_name.value.length >= minInputLenth) { boolName = true; } else { boolName = false; }

    // check email
    if(validateEmail(customer_mail.value)) { boolMail = true; } else { boolMail = false; }

    // check phone
    if(!customer_phone.value.includes('_') && customer_phone.value.length > 1) { boolPhone = true; } else { boolPhone = false; }

    // check address
    if(customer_address.value != 'undefined' && customer_address.value.length >= minInputLenth) { boolAddres = true; } else { boolAddres = false; }
    
    // check privacy
    if(customer_privacy.checked) { boolPrivacy = true; } else { boolPrivacy = false; }

    // disable or enable button
    if(boolName && boolMail && boolPhone && boolAddres && boolPrivacy) {
    	open_order_detail.disabled = false;
    	order_submit.disabled = false;
    } else {
    	open_order_detail.disabled = true;
    	order_submit.disabled = true;
    }

    return (boolName && boolMail && boolPhone && boolAddres && boolPrivacy);
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function getBrowsSize(){
	var size = {
	    width: window.innerWidth || document.body.clientWidth,
	    height: window.innerHeight || document.body.clientHeight
	}
	return size;
}

function getOrderData(){
	orderData = {
		name: 			elmByQuery('[name="customer_name"]').value,
		email: 			elmByQuery('[name="customer_mail"]').value,
		phone: 			elmByQuery('[name="customer_phone"]').value,
		address: 		elmByQuery('[name="customer_address"]').value,
		privPolicy:		elmByName('customer_privacy')[0].checked,
		bottleVariant: 	elmByQuery('.volume_variant_active .volume_value').innerText,
		bottleCount: 	elmByQuery('.volume_variant_active [name="count_field"]').value,
		dateDelivery: 	new Date(elmByQuery('.delivery_day .active_slide .delivery_date').value),
		timeDelivery: 	elmByQuery('.delivery_time .active_time').innerText,
		totalPrice: 	elmByQuery('.total_price_value .int_value').innerText,
	};
}

function setDelivInterval(arr){
	let timeArr;
	if(elmByQuery('.active_slide .week_value').innerText == 'сб' ||  elmByQuery('.active_slide .week_value').innerText == 'вс') {
		timeArr = arr.weekend;
	} else {
		timeArr = arr.weekdays;
	}

	var wrapper = document.createElement('div');
	wrapper.classList.add('delivery_time_list');

	for (var i = 0; i < timeArr.length; i++) {
		var item = document.createElement("div");
		item.classList.add('delivery_time_item');
		if(i == 0) item.classList.add('active_time');
		item.innerText =  timeArr[i];
		wrapper.append(item);
	};

	elmByQuery('.delivery_time_list').replaceWith(wrapper);
}

function clearAllUserFields(){
	elmByQuery('[name="customer_name"]').value = '';
	elmByQuery('[name="customer_mail"]').value = '';
	elmByQuery('[name="customer_phone"]').value = '';
	elmByQuery('[name="customer_address"]').value = '';
	elmByName('customer_privacy')[0].checked = true;
}

function elemHide(elems) {
	size = getBrowsSize();
    elems.forEach( function(element) {
        if(element == '.left_block' && size.width > mobileWith) {
            return;
        } else {
            elmByQuery(element).style.display = 'none';
        }
    });
}

function showBlock(elems) {
    elems.forEach( function(element) {
        elmByQuery(element).style.display = 'flex';
    });
}

function setInner(elem, innerText) {
    elmByQuery(elem).innerText = innerText;
}

function elmByQuery(query){
	return document.querySelector(query);
}

function elmByQueryAll(query){
	return document.querySelectorAll(query);
}

function elmByClass(class_name){
	return document.getElementsByClassName(class_name);
}

function elmById(id){
	return document.getElementById(id);
}

function elmByName(name){
	return document.getElementsByName(name);
}

function randomInteger(min, max) {
  let rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.round(rand);
}