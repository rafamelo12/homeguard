$('form').validate({
	rules: {
		first_name: {
			required: true,
			minlength: 3
		}
		last_name: {
			required: true,
			minlength: 3
		}
		email: {
			required: true,
			minlength: 3
		}
	}
})