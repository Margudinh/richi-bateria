import { Entity, PrimaryGeneratedColumn, Column, BaseEntity} from "typeorm";

@Entity()
export class Customer extends BaseEntity {
    @PrimaryGeneratedColumn()
    id = undefined;

    @Column({type: "varchar", nullable: false})
    firstName = "";

    @Column({type: "varchar", nullable: false})
    lastName = "";

    @Column({type: "varchar", nullable: false, unique: true})
    email = "";

    @Column({type: "varchar", nullable: false})
    password = "";

    @Column({type: "bigint", nullable: true})
    phone = undefined;
}