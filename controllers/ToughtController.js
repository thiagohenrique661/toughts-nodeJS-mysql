const Tought = require('../model/Tought');
const User = require('../model/User');

const { Op } = require('sequelize');

module.exports = class ToughtsController{

    static async showToughts (req,res) {
        
        let search = ''
        if (req.query.search) {
            search = req.query.search;
            
        }

        let order = 'DESC';

        if (req.query.order ==='old') {
            order = 'ASC';
            
        }else{
            order = 'DESC';
        }

        const toughtsData = await Tought.findAll({
            include: User,
            where: {
                title: { [Op.like]: `%${search}%` },
            },
            order: [['createdAt', order]],
        });
       
        const toughts = toughtsData.map((result) => result.get({plain: true}));

        let toughtsQty = toughts.length;

        if(toughtsQty ===0) {
            toughtsQty = false;
        }

        res.render('toughts/home', {toughts, search, toughtsQty});
    }

    static async dashboard(req, res) {
        const userId = req.session.userid

        const user = await User.findOne({
            where:{
                id: userId,
            },
            include: Tought,
            plain: true,
        })

        if (!user) {
            res.redirect('/login');   
        }
        const toughts = user.Toughts.map((result) => result.dataValues);
       
       let emptyToughts =  false;

       if (toughts.length === 0) {
        let emptyToughts = true;
       }
        res.render('toughts/dashboard', {toughts, emptyToughts});
    }



    static async removetought (req, res) {
        const id = req.body.id;
        const UserId = req.session.userid

        try {
            await Tought.destroy({where: {id: id, UserId: UserId }});
            req.flash('message', 'Thought deleted');
            res.redirect('/toughts/dashboard');
        } catch (error) {
            console.log(error);
            req.flash('message', 'Something went wrong');
            res.redirect('/toughts/dashboard');
            
        }
    }

    static updateTought(req, res) {
        const id = req.params.id
    
        Tought.findOne({ where: { id: id }, raw: true })
          .then((tought) => {
            res.render('toughts/edit', { tought })
          })
          .catch((err) => console.log())
      }

      static updateToughtPost(req, res) {
        const id = req.body.id
    
        const tought = {
          title: req.body.title,
          description: req.body.description,
        }
    
        Tought.update(tought, { where: { id: id } })
          .then(() => {
            req.flash('message', 'Pensamento atualizado com sucesso!')
            req.session.save(() => {
              res.redirect('/toughts/dashboard')
            })
          })
          .catch((err) => console.log())
      }


    static  createTought (req, res) {
            res.render('toughts/create');
        }

    static async createToughtSave(req,res){
        const tought = {
            title: req.body.title,
            UserId: req.session.userid,
        }
        try {
            await Tought.create(tought);

        req.flash('message', 'Toughts saved successfully');
        req.session.save(() =>{
            res.redirect('/toughts/dashboard');
        });
       
       
        } catch (error) {
            console.log(error);
            req.flash('message', 'Something went wrong');
            res.redirect('/toughts/create');
            
        }
    }

}

