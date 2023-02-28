import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('index', () => {
    it('should return the expected response object', () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const helloMessage = 'Hello, world!';
      const expectedResponse = {
        status: 'success',
        message: helloMessage,
      };
      jest.spyOn(appService, 'getHello').mockReturnValue(helloMessage);

      appController.index(res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResponse);
    });
  });
});
