import { Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Customer{
    @PrimaryGeneratedColumn()
    id = undefined;

    @Column({type: "varchar", nullable: false})
    firstName = "";

    @Column({type: "varchar", nullable: false})
    lastName = "";

    @Column("varchar")
    email = "";

    @Column("varchar")
    password = "";
}