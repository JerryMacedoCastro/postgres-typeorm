import * as mongoose from 'mongoose';
import IUser from './users.interface';

const addressSchema = new mongoose.Schema({
  city: String,
  street: String,
});

const userSchema = new mongoose.Schema({
  address: addressSchema,
  firstName: String,
  lastName: String,
  fullName: String,
  email: String,
  password: String,
  posts: [
    {
      ref: 'Post',
      type: mongoose.Schema.Types.ObjectId,
    },
  ],
});

const userModel = mongoose.model<IUser & mongoose.Document>('User', userSchema);

export default userModel;
