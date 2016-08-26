using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using BiometricAuth.BWS;

namespace BiometricAuth.Controllers
{
    public class BiometricController : ApiController
    {
        [HttpGet]
        [Route("api/Upload/Enroll")]
        public string UploadEnrolSample()
        {
            string messages = "";
            List<string> s = new List<string>();
            s.Add("E:\\Applications\\BiometricAuth\\BiometricAuth\\samples\\voice\\s1.wav");
            s.Add("E:\\Applications\\BiometricAuth\\BiometricAuth\\samples\\voice\\s2.wav");
            s.Add("E:\\Applications\\BiometricAuth\\BiometricAuth\\samples\\image\\sample1.png");
            s.Add("E:\\Applications\\BiometricAuth\\BiometricAuth\\samples\\image\\sample2.png");
            //s.Add("E:\\Applications\\BiometricAuth\\BiometricAuth\\samples\\voice\\output.wav");

            BiometricClassID bcid = new BiometricClassID();
            bcid.ClassID = 1234;
            bcid.Partition = 10212;
            bcid.Storage = "bws";
            Sample[] samples;
            try
            {
                samples = s.Select(file => new Sample
                    {
                        Trait = file.EndsWith("wav", StringComparison.OrdinalIgnoreCase) ? Trait.Voice : Trait.Face,
                        Data = System.IO.File.ReadAllBytes(file)
                    }).ToArray();
            }
            catch (Exception e)
            {
                return e.Message;
            }

            BioIDWebServiceClient client = null;
            try
            {
                // connect to  BWS
                client = new BioIDWebServiceClient();                
                // go for the commands:
                // - Enrollment
                if (bcid != null)
                {
                    var flags = EnrollmentFlags.None;

                    try
                    {
                        bool success = client.Enroll(bcid, samples, flags, out messages);
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine("error...:");
                        Console.WriteLine(e.Message);
                    }
                }
            }

            catch (Exception e)
            {
                Console.WriteLine("Exception caught:");
                Console.WriteLine(e.Message);
            }
            return messages;
        }


        [HttpGet]
        [Route("api/Upload/Verify")]
        public string UploadVerifySample()
        {
            string messages = "";
            List<string> s = new List<string>();
            s.Add("E:\\Applications\\BiometricAuth\\BiometricAuth\\samples\\voice\\s1.wav");
            s.Add("E:\\Applications\\BiometricAuth\\BiometricAuth\\samples\\voice\\s2.wav");
            s.Add("E:\\Applications\\BiometricAuth\\BiometricAuth\\samples\\image\\sample1.png");
            s.Add("E:\\Applications\\BiometricAuth\\BiometricAuth\\samples\\image\\sample2.png");
            BiometricClassID bcid = new BiometricClassID();
            bcid.ClassID = 1234;
            bcid.Partition = 10212;
            bcid.Storage = "bws";
            Sample[] samples;
            try
            {
                samples = s.Select(file => new Sample
                {
                    Trait = file.EndsWith("wav", StringComparison.OrdinalIgnoreCase) ? Trait.Voice : Trait.Face,
                    Data = System.IO.File.ReadAllBytes(file)
                }).ToArray();
            }
            catch (Exception e)
            {
                return e.Message;
            }

            BioIDWebServiceClient client = null;
            try
            {
                // connect to  BWS
                client = new BioIDWebServiceClient();

                // go for the commands:
                // - Enrollment
                if (bcid != null)
                {
                    var flags = ClassificationFlags.None;

                    try
                    {
                        bool success = client.Verify(bcid, samples, flags, out messages);
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine("error...:");
                        Console.WriteLine(e.Message);
                    }
                }

            }

            catch (Exception e)
            {
                Console.WriteLine("Exception caught:");
                Console.WriteLine(e.Message);
            }
            return messages;
        }
    }
}
