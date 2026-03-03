exports.up = async function (knex) {
	return knex("products").insert([
		{
			product_name: "Silver Founder's Pack",
			unity_value: 200,
			coins_quantity: 230,
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
			unity_value: 499,
			coins_quantity: 650,
			payment_type: 'pix'
		},
		{
			product_name: "Silver Founder's Pack",
			unity_value: 210,
			coins_quantity: 230,
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
			unity_value: 517,
			coins_quantity: 650,
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