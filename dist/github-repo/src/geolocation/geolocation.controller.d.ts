import { GeolocationService } from './geolocation.service';
export declare class GeolocationController {
    private readonly geolocationService;
    constructor(geolocationService: GeolocationService);
    getAddress(address: string): Promise<string>;
}
