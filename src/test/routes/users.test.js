const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

const { getInstance } = require('../setup-crowi');

describe('users', () => {
  let crowi;
  let app;

  beforeAll(async() => {
    crowi = await getInstance();
    // get injected manual mocks express
    app = express();
    jest.mock('~/server/middlewares/login-required');
    const loginRequired = require('~/server/middlewares/login-required');
    loginRequired.mockImplementation(() => {
      return function(_req, _res, next) {
        next();
      };
    });
    jest.mock('~/server/middlewares/admin-required');
    const adminRequired = require('~/server/middlewares/admin-required');
    adminRequired.mockImplementation(() => {
      return function(_req, _res, next) {
        next();
      };
    });
    jest.mock('~/server/middlewares/access-token-parser');
    const accessTokenParser = require('~/server/middlewares/access-token-parser');
    accessTokenParser.mockImplementation(() => {
      return function(req, _res, next) {
        req.user = 'loginUser';
        next();
      };
    });
    jest.mock('~/server/middlewares/csrf');
    const csrf = require('~/server/middlewares/csrf');
    csrf.mockImplementation(() => {
      return function(_req, _res, next) {
        next();
      };
    });
    app.use('/', require('~/server/routes/apiv3/users')(crowi));
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: false }))
  });

  describe('GET /', () => {
    describe('when normal execution User.paginate', () => {
      beforeAll(() => {
        crowi.models.User.paginate = jest.fn();
      });
      /* eslint-disable indent */
      test.each`
        page  | selectedStatusList  | searchText  | sortOrder  | sort     | searchWord  | sortQuery | statusNoList
        ${1}  | ${['registered']}   | ${''}       | ${'asc'}   | ${'id'}  | ${/(?:)/}   | ${1}      | ${[1]}
        ${1}  | ${['all']}          | ${''}       | ${'asc'}   | ${'id'}  | ${/(?:)/}   | ${1}      | ${[1, 2, 3, 5]}
        ${1}  | ${['registered']}   | ${'hoge'}   | ${'asc'}   | ${'id'}  | ${/hoge/}   | ${1}      | ${[1]}
        ${1}  | ${['registered']}   | ${''}       | ${'desc'}  | ${'id'}  | ${/(?:)/}   | ${-1}     | ${[1]}
      `(
        'respond 200 when queries are { page: $page, selectedStatusList[]: $selectedStatusList, searchText: $searchText, sortOrder: $sortOrder, sort: $sort }',
        async({
          page, selectedStatusList, searchText, sortOrder, sort, searchWord, sortQuery, statusNoList,
        }) => {
          const response = await request(app).get('/').query({
            page, 'selectedStatusList[]': selectedStatusList, searchText, sortOrder, sort,
          });
          expect(app.response.apiv3Err).not.toHaveBeenCalled();
          expect(response.statusCode).toBe(200);
          expect(crowi.models.User.paginate).toHaveBeenCalled();
          expect(crowi.models.User.paginate.mock.calls[0]).toMatchObject(
            [
              {
                $and: [
                  {
                    status: {
                      $in: statusNoList,
                    },
                  },
                  {
                    $or: [
                      { name: { $in: searchWord } },
                      { username: { $in: searchWord } },
                      { email: { $in: searchWord } },
                    ],
                  },
                ],
              },
              {
                sort: { [sort]: sortQuery },
                page,
                limit: 50,
                select: crowi.models.User.USER_PUBLIC_FIELDS,
              },
            ],
          );
        },
      );
      /* eslint-disable indent */
    });

    describe('when throw Error from User.paginate', () => {
      beforeAll(() => {
        crowi.models.User.paginate = jest.fn().mockImplementation(() => { throw Error('error') });
      });
      test('respond 500', async() => {
        const response = await request(app).get('/').query({
          page: 1, 'selectedStatusList[]': 'all', sort: 'id', sortOrder: 'asc',
        });
        expect(response.statusCode).toBe(500);
        expect(response.body.errors.code).toBe('user-group-list-fetch-failed');
        expect(response.body.errors.message).toBe('Error occurred in fetching user group list');
      });
    });

    describe('validator.statusList', () => {
      test('respond 400 when invalid selectedStatusList', async() => {
        const response = await request(app).get('/').query({
          page: 1, 'selectedStatusList[]': 'hoge', sort: 'id', sortOrder: 'asc',
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toMatchObject([{ code: 'validation_failed', message: 'selectedStatusList: Invalid value' }]);
      });
      test('respond 400 when invalid sortOrder', async() => {
        const response = await request(app).get('/').query({
          page: 1, 'selectedStatusList[]': 'all', sort: 'id', sortOrder: 'hoge',
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toMatchObject([{ code: 'validation_failed', message: 'sortOrder: Invalid value' }]);

      });
      test('respond 400 when invalid sort', async() => {
        const response = await request(app).get('/').query({
          page: 1, 'selectedStatusList[]': 'all', sort: 'hoge', sortOrder: 'asc',
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toMatchObject([{ code: 'validation_failed', message: 'sort: Invalid value' }]);

      });
      test('respond 400 when invalid page', async() => {
        const response = await request(app).get('/').query({
          page: 'hoge', 'selectedStatusList[]': 'all', sort: 'id', sortOrder: 'asc',
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toMatchObject([{ code: 'validation_failed', message: 'page: Invalid value' }]);
      });
    });
  });

  describe('GET /:id/recent', () => {
    describe('normal test', () => {
      beforeAll(() => {
        crowi.models.User.findById = jest.fn().mockImplementation(() => { return 'user' });
        const toObjectMock = jest.fn().mockImplementation(() => { return 'userObject' });
        crowi.models.Page.findListByCreator = jest.fn().mockImplementation(() => { return { pages: [{ lastUpdateUser: { toObject: toObjectMock } }] } });
      });
      test('respond 200 when set query limit', async() => {
        const response = await request(app).get('/userId/recent').query({
          page: 1, limit: 10,
        });

        expect(crowi.models.Page.findListByCreator.mock.calls[0]).toMatchObject(
          ['user', 'loginUser', { offset: 0, limit: 10 }],
        );
        expect(response.statusCode).toBe(200);
      });
      test('respond 200 when no set limit and set customize:showPageLimitationM', async() => {
        crowi.configManager.getConfig = jest.fn().mockImplementation(() => { return 20 });

        const response = await request(app).get('/userId/recent').query({
          page: 1,
        });

        expect(crowi.models.Page.findListByCreator.mock.calls[0]).toMatchObject(
          ['user', 'loginUser', { offset: 0, limit: 20 }],
        );
        expect(response.statusCode).toBe(200);
      });
      test('respond 200 when no set limit and no set customize:showPageLimitationM', async() => {
        crowi.configManager.getConfig = jest.fn().mockImplementation(() => { return null });

        const response = await request(app).get('/userId/recent').query({
          page: 1,
        });

        expect(crowi.models.Page.findListByCreator.mock.calls[0]).toMatchObject(
          ['user', 'loginUser', { offset: 0, limit: 30 }],
        );
        expect(response.statusCode).toBe(200);
      });
    });

    describe('validator.recentCreatedByUser', () => {
      test('respond 400 when limit is larger then 300', async() => {
        const response = await request(app).get('/userId/recent').query({
          limit: 500,
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toMatchObject([{ code: 'validation_failed', message: 'limit: You should set less than 300 or not to set limit.' }]);
      });
    });

    describe('when throw Error from User.findById', () => {
      beforeAll(() => {
        crowi.models.User.findById = jest.fn().mockImplementation(() => { throw Error('error') });
      });
      test('respond 500', async() => {
        const response = await request(app).get('/userId/recent').query({
          page: 1,
        });
        expect(response.statusCode).toBe(500);
        expect(response.body.errors.code).toBe('retrieve-recent-created-pages-failed');
        expect(response.body.errors.message).toBe('Error occurred in find user');
      });
    });

    describe('when dont return user from User.findById', () => {
      beforeAll(() => {
        crowi.models.User.findById = jest.fn().mockImplementation(() => { return null });
      });
      test('respond 400', async() => {
        const response = await request(app).get('/userId/recent').query({
          page: 1,
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.errors.message).toBe('find-user-is-not-found');
      });
    });

    describe('when throw Error from Page.findListByCreator', () => {
      beforeAll(() => {
        crowi.models.User.findById = jest.fn().mockImplementation(() => { return 'user' });
        crowi.models.Page.findListByCreator = jest.fn().mockImplementation(() => { throw Error('error') });
      });
      test('respond 500', async() => {
        const response = await request(app).get('/userId/recent').query({
          page: 1,
        });
        expect(response.statusCode).toBe(500);
        expect(response.body.errors.code).toBe('retrieve-recent-created-pages-failed');
        expect(response.body.errors.message).toBe('Error occurred in retrieve recent created pages for user');
      });
    });
  });

  describe('GET /exists', () => {
    describe('when exists user', () => {
      beforeAll(() => {
        crowi.models.User.findUserByUsername = jest.fn().mockImplementation(() => { return 'user' });
      });
      test('respond exists true', async() => {
        const response = await request(app).get('/exists').query({
          username: 'hoge',
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.data.exists).toBe(true);
      });
    });

    describe('when no exists user', () => {
      beforeAll(() => {
        crowi.models.User.findUserByUsername = jest.fn().mockImplementation(() => { return null });
      });
      test('respond exists false', async() => {
        const response = await request(app).get('/exists').query({
          username: 'hoge',
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.data.exists).toBe(false);
      });
    });

    describe('when throw Error from User.findUserByUsername', () => {
      beforeAll(() => {
        crowi.models.User.findUserByUsername = jest.fn().mockImplementation(() => { throw Error('error') });
      });
      test('respond 400', async() => {
        const response = await request(app).get('/exists').query({
          username: 'hoge',
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toBeDefined();
      });
    });

    describe('validator.exists', () => {
      test('respond 400 when username is not string', async() => {
        const response = await request(app).get('/exists').query({
          username: 1,
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toBeDefined();
      });
      test('respond 400 when username is empty', async() => {
        const response = await request(app).get('/exists');
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toBeDefined();
      });
    });
  });

  describe('POST /invite', () => {
    describe('when return invitedUserList', () => {
      beforeAll(() => {
        crowi.models.User.createUsersByInvitation = jest.fn().mockImplementation(() => { return ['user'] });
      });
      test('respond exists true', async() => {
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json());
        const response = await request(app)
          .post('/invite')
          .send({ shapedEmailList: ['user'], sendEmail: false })
          .set('Content-Type', 'application/json')
          .set('Accept', 'application/json')
          .end((err, res) => {
            if (err) return done(err);
          });
        expect(response.statusCode).toBe(200);
        expect(response.body).toBe(['user']);
      });
    });

  });

  describe.skip('PUT /:id/giveAdmin', () => {

  });

  describe.skip('PUT /:id/removeAdmin', () => {

  });

  describe.skip('PUT /:id/activate', () => {

  });

  describe.skip('PUT /:id/deactivate', () => {

  });

  describe.skip('DELETE /:id/remove', () => {

  });

  describe.skip('GET /external-accounts/', () => {

  });

  describe.skip('DELETE /external-accounts/:id/remove', () => {

  });

  describe.skip('PUT /update.imageUrlCache', () => {

  });

  describe.skip('PUT /reset-password', () => {

  });
});
