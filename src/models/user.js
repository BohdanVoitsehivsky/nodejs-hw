import { Schema, model } from "mongoose";

const userSchema = new Schema({
  username: {type:String, trim: true},
  email: {type: String, required: true, unique: true, trim: true},
  password: {type: String, required:true},

}, {timestamps: true, versionKey: false}
);
// хук .pre
userSchema.pre("save", function (next) {
  if(!this.username) {
    this.username = this.email;
  }
  next();
});

// щоб кожного разу не писати в контролерах реєстрації чи передали юзернейм
// видаляємо із відповіді пароль
userSchema.method.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;

};

export const User = model("User", userSchema);
