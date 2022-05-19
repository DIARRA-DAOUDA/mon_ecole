const nodemailer=require('nodemailer');

const sendEmail=async options=>{
    //1/create a transporter

    //FOR GMAIL
    // const transporter=nodemailer.createTransport({
    //     service:'Gmail',
    //     auth:{
    //         user:process.env.EMAIL_USERNAME,
    //         pass:process.env.EMAIL_PASSWORD
    //     }
    //     //Activate in gmail "less secure app" option
    // });

    //FOR MAILTRAP
    var transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });

    //2/Define the options
    const mailOptions={
        from:'Ibson premier <hello@jonas.io>',
        to:options.email,
        subject:options.subject,
        text:options.message
        // html:
    }

    //3/Actually send the email
   await transporter.sendMail(mailOptions);
}

module.exports=sendEmail;