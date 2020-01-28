const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');
const should = chai.should();
chai.use(chaiHttp);
describe('/POST user', () => {
    it('Post request fail', (done) => {
        const user = {
            first_name: " Husne Ara",
            email_address: "asma@gmail.com"
        };        
        chai.request(app)
        .post('/v1/user')
        .send(user)
        .end((err, res) => {
            res.should.have.status(400);
            done();
        });
    });
});
