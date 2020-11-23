import * as mongoose from 'mongoose';
import IUser from './users.interface';

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const userModel = mongoose.model<IUser & mongoose.Document>('User', userSchema);

export default userModel;
