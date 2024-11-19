const studentSchema = new mongoose.Schema({
    id: Number,     
	name: String,
	email: String,
    branch: String,
    section: String,
    rollNo: Number,
    regNo: Number,
    academicYear: Number
});
