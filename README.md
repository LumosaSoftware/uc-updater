# UC-updater

A docker container that can be used to flash UC with a given firmware.<br/>
Only the firmware and correct serial ports are needed.

To start flashing run the docker container with some values:

- Env var of MCU's
- Path to serial devices
- Path to firmware folder

## Options

`--env` to set env-var in container<br/>
`--device` parse serial port to container<br/>

### Envs

`UC_1_PATH` Enter the path to serial for UC1<br/>
`UC_2_PATH` Enter the path to serial for UC2<br/>
`UC_1_BAUD` Enter the baudrate of UC1 (default 115200)<br/>
`UC_2_BAUD` Enter the baudrate of UC2 (default 115200)<br/>
`RESET_ONLY` Ony Reset the UC, not flash htem

### Only flash one MCU

```docker
--env UC1_PATH=/dev/mcu1
--device /dev/ttyS0:/dev/mcu1
```

### Flash both MCU'2

```docker
--env UC1_PATH=/dev/mcu1
--env UC2_PATH=/dev/mcu2
--device /dev/ttyS0:/dev/mcu1
--device /dev/ttyS1:/dev/mcu2
```

### Firmware

The firmware needs to be named `firmware-uc.elf` to be picked up by the script.<br/>
Mount the correct folder where the firmware is located.

```docker
 --volume <local folder>/<local firmware>.elf:/firmware-uc/firmware-uc.elf
```

## Execute flashing

```docker
docker run -it --rm
  --env UC1_PATH=/dev/mcu1
  --env UC2_PATH=/dev/mcu2
  --device /dev/gpiomem
  --device /dev/ttyS0:/dev/mcu1
  --device /dev/ttyS1:/dev/mcu2
  --volume /home/pi/firmware.elf:/firmware-uc/firmware-uc.elf
  --name uc-updater
  ghcr.io/lumosasoftware/uc-updater:<tag>
```

## Restart only

```docker
docker run -it --rm
  --env UC1_PATH=/dev/mcu1
  --env UC2_PATH=/dev/mcu2
  --env RESET_ONLY=true
  --device /dev/gpiomem
  --device /dev/ttyS0:/dev/mcu1
  --device /dev/ttyS1:/dev/mcu2
  --name uc-updater
  ghcr.io/lumosasoftware/uc-updater:<tag>
```

## Info

The GPIO pins for the RPI are now hardcoded into the openocd .cfg files.<br/>
This is why there are two files for both UC's.

If needed we can change the script in a way would make these pins configurable.
