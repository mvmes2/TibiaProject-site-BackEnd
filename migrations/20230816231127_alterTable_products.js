exports.up = async function (knex) {
	return knex("products").insert([
		{
			product_name: "Silver Founder's Pack",
			unity_value: 200,
			coins_quantity: 350,
			payment_type: 'pix'
		},
		{
			product_name: "Gold Founder's Pack",
			unity_value: 350,
			coins_quantity: 525,
			payment_type: 'pix'
		},
		{
			product_name: "Diamond Founder's Pack",
			unity_value: 550,
			coins_quantity: 775,
			payment_type: 'pix'
		},
		{
			product_name: "Silver Founder's Pack",
			unity_value: 210,
			coins_quantity: 350,
			payment_type: 'creditCard'
		},
		{
			product_name: "Gold Founder's Pack",
			unity_value: 362,
			coins_quantity: 525,
			payment_type: 'creditCard'
		},
		{
			product_name: "Diamond Founder's Pack",
			unity_value: 570,
			coins_quantity: 775,
			payment_type: 'creditCard'
		}
	]);
};

exports.down = async function (knex) {
	await knex('modulo_seguradora_perguntas_observacao')
		.del()
		.where({
			product_name: "Silver Founder's Pack",
			product_name: "Gold Founder's Pack",
			product_name: "Diamond Founder's Pack"
		})
};