import Event from '../models/Event';
import EventModel from '../models/Event';
import { MongoMemoryServer } from 'mongodb-memory-server';
import client from '../../../client';
import listEvents from '../subCommands/listEvents';
import mongoose from 'mongoose';
import 'babel-polyfill';

describe('adding Event', () => {
  let uri;

  test('ama lists all events', async () => {
    // Given
    await Event({
      date: new Date('2015-05-01T12:00:00Z'),
      title: 'Old 1'
    }).save();

    await Event({
      date: new Date('2015-03-01T12:00:00Z'),
      title: 'Old 2'
    }).save();

    await Event({
      date: new Date('2125-05-01T12:00:00Z'),
      title: 'New 1'
    }).save();

    await Event({
      date: new Date('2128-03-15T12:00:00Z'),
      title: 'New 2'
    }).save();

    await Event({
      date: new Date('2128-04-20T12:00:00Z'),
      title: 'New 3'
    }).save();

    //When
    await listEvents.handler([]);

    // Then
    const expectedEventList = `__**Past Events**__
Sun Mar 01 2015: Old 2
Fri May 01 2015: Old 1

__**Upcoming Event**__
Tue May 01 2125: New 1

__**Future Events**__
Mon Mar 15 2128: New 2
Tue Apr 20 2128: New 3
`;

    await EventModel.deleteMany({});
    expect(client.message.channel.send).toHaveBeenCalledWith(expectedEventList);
  });

  test('ama sends message when no events available', async () => {
    // When
    await listEvents.handler([]);

    // Then
    expect(client.message.channel.send).toHaveBeenCalledWith(
      'No events yet :('
    );
  });

  beforeAll(async () => {
    client.message = {
      channel: {
        send: jest.fn()
      }
    };

    const mongod = new MongoMemoryServer();
    uri = await mongod.getUri();
  });

  beforeEach(async () => {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });
});
