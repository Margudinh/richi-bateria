import {Entity, BaseEntity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany} from 'typeorm';

@Entity()
export class Order extends BaseEntity{
    @PrimaryGeneratedColumn()
    id = undefined;

    @Column({type: "enum", enum: ['cart','paid'], nullable: false, default: 'cart'})
    status = ''
}
