import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GeolocationService {
  private apiKey = process.env.API_KEY;

  async geocode(address: string): Promise<any> {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/geocode/json',
      {
        params: {
          address,
          key: this.apiKey,
        },
      },
    );

    if (response.data.status === 'OK') {
      return response.data.results[0].geometry.location;
    } else if (response.data.status === 'ZERO_RESULTS') {
      throw new Error('No results found for this address');
    } else if (response.data.status === 'OVER_QUERY_LIMIT') {
      throw new Error('You are over your query limit');
    } else if (response.data.status === 'REQUEST_DENIED') {
      throw new Error('Your request was denied');
    } else if (response.data.status === 'INVALID_REQUEST') {
      throw new Error('The request is missing an address');
    } else {
      throw new Error('Server error');
    }
  }

  async getNeighborhood(lat: number, lng: number): Promise<string | undefined> {
    const response = await axios.get(
      'https://www.portlandmaps.com/arcgis/rest/services/Public/COP_OpenData/MapServer/125/query',
      {
        params: {
          f: 'json', // This specifies that the response format should be JSON.
          where: '1=1', // This is effectively a no-op filter that matches all records.
          geometryType: 'esriGeometryPoint', // This specifies that the geometry is a point.
          spatialRel: 'esriSpatialRelIntersects', // This specifies that the query should return any neighborhoods that intersect with the given point.
          outFields: '*', // This specifies that all fields should be returned in the response
          returnGeometry: 'false', // This specifies that the geometry of the neighborhood should not be returned in the response
          geometry: `${lng},${lat}`, // This specifies the point for which to return intersecting neighborhoods
          inSR: '4326', // This specifies that the input spatial reference is WGS 1984
        },
      },
    );

    if (response.status !== 200) {
      throw new Error('Failed to get neighborhood');
    }

    // If no neighborhood was found, return undefined
    if (!response.data.features || response.data.features.length === 0) {
      console.log('No neighborhood found');
      return undefined;
    }

    return response.data.features[0].attributes.NBRHOOD;
  }

  async checkAddress(
    address: string,
    originalNeighborhood: string,
    iteration = 0,
  ): Promise<string> {
    if (iteration % 10 === 0) {
      // this counter logs a message every 10th iteration to provide feedback to the user
      console.log(`Checking address for the ${iteration}th time...`);
    }

    if (iteration > 160) {
      return 'No other neighborhood found within the recursion limit.';
    }

    // increment the street number by 100 as requested
    const addressParts = address.split(' ');
    const streetNumber = parseInt(addressParts[0]);
    addressParts[0] = (streetNumber + 100).toString();
    const newAddress = addressParts.join(' ');

    // geocode method defined above the new address
    const location = await this.geocode(newAddress);

    // get the neighborhood of the new address
    const neighborhood = await this.getNeighborhood(location.lat, location.lng);

    if (neighborhood && neighborhood !== originalNeighborhood) {
      // if the neighborhood has changed and is not undefined, return the new address
      console.log(
        `New neighborhood found: ${neighborhood}. The address is: ${newAddress}`,
      );
      return newAddress;
    } else {
      // if the neighborhood hasn't changed or is undefined, call this function again with the new address
      return this.checkAddress(newAddress, originalNeighborhood, iteration + 1);
    }
  }
}
