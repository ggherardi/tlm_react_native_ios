export const GetCountries = (codes: string[]): (Country | undefined)[] => {
    return codes.map(c => GetCountry(c));
}

export const GetCountry = (code: string): Country | undefined => {
    return Countries.find(c => c.code.toLowerCase() == code.toLowerCase());
}

export class Country {
    name!: string;
    code!: string;
}

export const Countries: Country[] = [{
    code: 'IT',
    name: 'Italy'
},
{
    code: 'DE',
    name: 'Germany'
},
{
    code: 'FR',
    name: 'France'
}];