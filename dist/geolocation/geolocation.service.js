"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeolocationService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
let GeolocationService = class GeolocationService {
    constructor() {
        this.apiKey = process.env.API_KEY;
    }
    async geocode(address) {
        const response = await axios_1.default.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address,
                key: this.apiKey,
            },
        });
        if (response.data.status === 'OK') {
            return response.data.results[0].geometry.location;
        }
        else if (response.data.status === 'ZERO_RESULTS') {
            throw new Error('No results found for this address');
        }
        else if (response.data.status === 'OVER_QUERY_LIMIT') {
            throw new Error('You are over your query limit');
        }
        else if (response.data.status === 'REQUEST_DENIED') {
            throw new Error('Your request was denied');
        }
        else if (response.data.status === 'INVALID_REQUEST') {
            throw new Error('The request is missing an address');
        }
        else {
            throw new Error('Server error');
        }
    }
    async getNeighborhood(lat, lng) {
        const response = await axios_1.default.get('https://www.portlandmaps.com/arcgis/rest/services/Public/COP_OpenData/MapServer/125/query', {
            params: {
                f: 'json',
                where: '1=1',
                geometryType: 'esriGeometryPoint',
                spatialRel: 'esriSpatialRelIntersects',
                outFields: '*',
                returnGeometry: 'false',
                geometry: `${lng},${lat}`,
                inSR: '4326',
            },
        });
        if (response.status !== 200) {
            throw new Error('Failed to get neighborhood');
        }
        if (!response.data.features || response.data.features.length === 0) {
            console.log('No neighborhood found');
            return undefined;
        }
        return response.data.features[0].attributes.NBRHOOD;
    }
    async checkAddress(address, originalNeighborhood, iteration = 0) {
        if (iteration % 10 === 0) {
            console.log(`Checking address for the ${iteration}th time...`);
        }
        if (iteration > 160) {
            return 'No other neighborhood found within the recursion limit.';
        }
        const addressParts = address.split(' ');
        const streetNumber = parseInt(addressParts[0]);
        addressParts[0] = (streetNumber + 100).toString();
        const newAddress = addressParts.join(' ');
        const location = await this.geocode(newAddress);
        const neighborhood = await this.getNeighborhood(location.lat, location.lng);
        if (neighborhood && neighborhood !== originalNeighborhood) {
            console.log(`New neighborhood found: ${neighborhood}. The address is: ${newAddress}`);
            return newAddress;
        }
        else {
            return this.checkAddress(newAddress, originalNeighborhood, iteration + 1);
        }
    }
};
GeolocationService = __decorate([
    (0, common_1.Injectable)()
], GeolocationService);
exports.GeolocationService = GeolocationService;
//# sourceMappingURL=geolocation.service.js.map