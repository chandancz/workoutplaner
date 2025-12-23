import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Role } from 'src/common/enums/role.enum';

@Schema({ timestamps: true })
export class User {
  @Prop()
  email?: string;

  @Prop()
  name?: string;

  @Prop()
  password: string;

  @Prop()
  address?: string;

  @Prop()
  phone?: string

  @Prop()
  countryCode?: string

  @Prop({ default: true })
  notificationOn?: boolean;

  @Prop()
  deviceToken?: string;


  @Prop({ default: false })
  isActive?: boolean;


  @Prop({ type: Number })
  resetOtp?: number | null;

  @Prop({ type: Number })
  resetOtpExpire?: number | null;

  @Prop({
    type: String,
    enum: Role,
    default: Role.USER,
  })
  role: Role;
}

export const UserSchema = SchemaFactory.createForClass(User);
