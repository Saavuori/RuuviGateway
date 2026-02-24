package main

import (
	"flag"

	"github.com/Saavuori/RuuviGateway/common/logging"
	"github.com/Saavuori/RuuviGateway/common/version"
	"github.com/Saavuori/RuuviGateway/config"
	"github.com/Saavuori/RuuviGateway/gateway"
	log "github.com/sirupsen/logrus"
)

func main() {
	configPath := flag.String("config", "./config.yml", "The path to the configuration")
	strictConfig := flag.Bool("strict-config", false, "Use strict parsing for the config file; will throw errors for invalid fields")
	versionFlag := flag.Bool("version", false, "Prints the version and exits")
	flag.Parse()
	version.Print()

	if *versionFlag {
		return
	}

	conf, err := config.ReadConfig(*configPath, *strictConfig)
	logging.Setup(conf.Logging) // logging should be set up with logging config before logging a possible error in the config, weird, I know
	log.Infof("Starting RuuviGateway version %s", version.Version)
	if err != nil {
		log.WithError(err).Fatal("Failed to load config")
	}
	log.WithFields(log.Fields{
		"configfile": *configPath,
	}).Debug("Config loaded")

	gateway.Run(conf, *configPath)
}
