export declare class GeolocationService {
    private apiKey;
    geocode(address: string): Promise<any>;
    getNeighborhood(lat: number, lng: number): Promise<string | undefined>;
    checkAddress(address: string, originalNeighborhood: string, iteration?: number): Promise<string>;
}
