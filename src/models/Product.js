import { Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Product{
    @PrimaryGeneratedColumn()
    id = undefined;

    @Column({type: "varchar" , unique: true, nullable: false})
    name = "";

    @Column("varchar")
    description = "";

    @Column({type: "decimal", nullable: false, scale: 2, precision: 7})
    unitPrice = 0;
}