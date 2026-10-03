import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['producer', 'consumer','admin'], default: 'consumer' }, 
  district:{type:String},
  state:{type:String},
});

const User = mongoose.model("User", userSchema);

export default User;
