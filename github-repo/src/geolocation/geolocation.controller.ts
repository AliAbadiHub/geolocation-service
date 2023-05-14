import { Controller, Get, Query } from '@nestjs/common';
import { GeolocationService } from './geolocation.service';

@Controller('geolocation')
export class GeolocationController {
  constructor(private readonly geolocationService: GeolocationService) {}

  @Get('address')
  async getAddress(@Query('address') address: string): Promise<string> {
    // First thing we do is geocode the original address
    const location = await this.geolocationService.geocode(address);

    // Then, we determine the original neighborhood latitude and longitude
    const originalNeighborhood = await this.geolocationService.getNeighborhood(
      location.lat,
      location.lng,
    );

    // Finally, we recursively check addresses until the neighborhood changes up to 1000 times (to avoid hitting the call stack limit and getting a RangeError)
    return this.geolocationService.checkAddress(address, originalNeighborhood);
  }
}
