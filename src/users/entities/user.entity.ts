import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

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
}

export const UserSchema = SchemaFactory.createForClass(User);
