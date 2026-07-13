export interface Mapper<Domain, Persistence> {
    toDomain(raw: Persistence): Domain;
    toPersistence(entity: Domain): Persistence;
}
