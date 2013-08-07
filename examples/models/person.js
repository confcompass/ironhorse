
module.exports = function(mongoose) {

	var PersonSchema = new mongoose.Schema({
		name: String,
		brithdate: Date
	});

	var Person = mongoose.model('Person', PersonSchema);

}